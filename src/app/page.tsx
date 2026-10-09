import Link from "next/link";
import { sanityFetch } from "@/sanity/lib/client";
import { LANDING_PAGE_QUERY } from "@/sanity/lib/queries";

// Keep HTML rendering server-side on every request while the CMS data itself
// remains cached until Sanity sends a change webhook.
export const dynamic = "force-dynamic";

type Feature = {
  _key: string;
  icon?: string;
  title: string;
  description: string;
};

type LandingPage = {
  _id: string;
  title: string;
  hero?: {
    eyebrow?: string;
    heading?: string;
    description?: string;
    primaryButtonText?: string;
    primaryButtonUrl?: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
  };
  features?: Feature[];
};

async function getLandingPage(): Promise<LandingPage | null> {
  /*
   * This is the critical part of the assignment.
   *
   * The query is tagged `landing-page` and has no time-based revalidation.
   * Therefore:
   *   1. First request -> CMS call + cache the result.
   *   2. Later requests -> serve the cached result, NO CMS call.
   *   3. Sanity publishes a change -> webhook invalidates `landing-page`.
   *   4. Next request -> one fresh CMS call + cache the new result.
   */
  return sanityFetch({
    query: LANDING_PAGE_QUERY,
    tags: ["landing-page"]
  });
}

export default async function HomePage() {
  const page = await getLandingPage();

  if (!page) {
    return (
      <main className="empty-state">
        <h1>Landing page content not found.</h1>
        <p>
          Open <code>/studio</code> and create a Landing Page document.
        </p>
      </main>
    );
  }

  const hero = page.hero;
  const features = page.features ?? [];

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-copy">
            {hero?.eyebrow && <span className="eyebrow">{hero.eyebrow}</span>}

            <h1>{hero?.heading}</h1>

            <p className="hero-description">{hero?.description}</p>

            <div className="button-row">
              {hero?.primaryButtonText && hero.primaryButtonUrl && (
                <Link className="button button-primary" href={hero.primaryButtonUrl}>
                  {hero.primaryButtonText}
                </Link>
              )}

              {hero?.secondaryButtonText && hero.secondaryButtonUrl && (
                <Link className="button button-secondary" href={hero.secondaryButtonUrl}>
                  {hero.secondaryButtonText}
                </Link>
              )}
            </div>
          </div>

          <div className="hero-card" aria-hidden="true">
            <div className="orb orb-one" />
            <div className="orb orb-two" />
            <div className="card-content">
              <span>CMS</span>
              <strong>Server Rendered</strong>
              <small>Cached until content changes</small>
            </div>
          </div>
        </div>
      </section>

      <section className="features" id="features">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">Why this approach?</span>
            <h2>Fast for users. Efficient for the CMS.</h2>
            <p>
              Content is rendered on the server and cached until Sanity tells
              the application that the content has changed.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature) => (
              <article className="feature-card" key={feature._key}>
                <div className="feature-icon">{feature.icon || "✦"}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>Built with Next.js + Sanity CMS</p>
        </div>
      </footer>
    </main>
  );
}