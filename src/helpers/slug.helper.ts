import slugify from 'slugify';
import crypto from 'crypto';

function randomSuffix(length = 4): string {
  return crypto.randomBytes(length).toString('hex').slice(0, length).toLowerCase();
}

export function buildSlugBase(title: string): string {
  const base = slugify(title, { lower: true, strict: true }).slice(0, 60);
  return base || 'event';
}

export async function generateUniqueSlug(
  title: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const base = buildSlugBase(title);
  let slug = `${base}-${randomSuffix()}`;
  while (await exists(slug)) {
    slug = `${base}-${randomSuffix()}`;
  }
  return slug;
}
