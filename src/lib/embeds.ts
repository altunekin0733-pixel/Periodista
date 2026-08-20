/**
 * Haber metninde tek başına duran YouTube, Spotify ve Apple bağlantılarını
 * gömülü oynatıcıya çevirir. Dönüşüm kayıt anında değil, gösterim anında
 * yapılır: hâlihazırda kayıtlı haberler de yeniden kaydedilmeden çalışır.
 *
 * Güvenlik: iframe adresi editörün yazdığı metinden kopyalanmaz; yalnızca
 * doğrulanmış kimlikten yeniden kurulur. Bu yüzden gövdedeki bağlantı
 * enjeksiyona açık değildir.
 */

type Embed = { src: string; title: string; ratio: 'video' | 'audio' };

const YOUTUBE_ID = /^[A-Za-z0-9_-]{6,20}$/;
const SPOTIFY_ID = /^[A-Za-z0-9]{16,32}$/;
const SPOTIFY_TYPES = new Set(['episode', 'show', 'track', 'album', 'playlist']);
const APPLE_PATH = /^[A-Za-z0-9/_%.-]{1,200}$/;

function youtubeEmbed(url: URL): Embed | null {
  const host = url.hostname.replace(/^www\./, '');

  let id = '';

  if (host === 'youtu.be') {
    id = url.pathname.slice(1);
  } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
    if (url.pathname === '/watch') id = url.searchParams.get('v') ?? '';
    else if (url.pathname.startsWith('/shorts/')) id = url.pathname.slice('/shorts/'.length);
    else if (url.pathname.startsWith('/embed/')) id = url.pathname.slice('/embed/'.length);
  }

  if (!YOUTUBE_ID.test(id)) return null;

  return {
    src: `https://www.youtube-nocookie.com/embed/${id}`,
    title: 'YouTube video oynatıcı',
    ratio: 'video',
  };
}

function spotifyEmbed(url: URL): Embed | null {
  if (url.hostname.replace(/^www\./, '') !== 'open.spotify.com') return null;

  const [type, id] = url.pathname.split('/').filter(Boolean);

  if (!SPOTIFY_TYPES.has(type) || !SPOTIFY_ID.test(id ?? '')) return null;

  return {
    src: `https://open.spotify.com/embed/${type}/${id}`,
    title: 'Spotify oynatıcı',
    ratio: 'audio',
  };
}

function appleEmbed(url: URL): Embed | null {
  const host = url.hostname.replace(/^www\./, '');
  const isPodcast = host === 'podcasts.apple.com';
  const isMusic = host === 'music.apple.com';

  if (!isPodcast && !isMusic) return null;
  if (!APPLE_PATH.test(url.pathname)) return null;

  const episode = url.searchParams.get('i') ?? '';
  const query = /^\d{1,20}$/.test(episode) ? `?i=${episode}` : '';
  const embedHost = isPodcast ? 'embed.podcasts.apple.com' : 'embed.music.apple.com';

  return {
    src: `https://${embedHost}${url.pathname}${query}`,
    title: isPodcast ? 'Apple Podcasts oynatıcı' : 'Apple Music oynatıcı',
    ratio: 'audio',
  };
}

function toEmbed(href: string): Embed | null {
  let url: URL;

  try {
    url = new URL(href);
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;

  return youtubeEmbed(url) ?? spotifyEmbed(url) ?? appleEmbed(url);
}

function toFigure(embed: Embed): string {
  return (
    `<figure class="media-embed is-${embed.ratio}">` +
    `<iframe src="${embed.src}" title="${embed.title}" loading="lazy" ` +
    'allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" ' +
    'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
    '</figure>'
  );
}

/** Yalnızca tek bir bağlantıdan ibaret paragraflar gömülü oynatıcıya döner. */
const LONE_LINK_PARAGRAPH = /<p>\s*<a\b[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>\s*<\/p>/gi;

export function embedMediaLinks(html: string): string {
  return html.replace(LONE_LINK_PARAGRAPH, (match, href: string) => {
    const embed = toEmbed(decodeHtmlEntities(href));

    return embed ? toFigure(embed) : match;
  });
}

/** `href` özniteliği sanitize sırasında kaçışlanmış olabilir. */
function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
