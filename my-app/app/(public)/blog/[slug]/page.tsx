import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import { getPostBySlug } from "@/lib/db";
import { cleanHtml } from "@/lib/sanitize";

type PageProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const showcaseStoriesContent: Record<
  string,
  {
    title: string;
    excerpt: string;
    content: string;
    category: string;
    featured_image: string;
    created_at: string;
  }
> = {
  "annapurna-sanctuary-fishtail": {
    title: "Sanctuary of the Gods: In the Shadow of Machapuchare",
    excerpt: "Traversing steep bamboo ravines into the high alpine natural amphitheater surrounded by Annapurna I and Fishtail Peak.",
    category: "Trekking",
    featured_image: "/images/annapurna-sanctuary.jpg",
    created_at: "2025-05-02T10:00:00Z",
    content: `<p>Rising steeply out of the subtropical Modi Khola valley, the Annapurna Sanctuary trek is one of the most revered mountain pilgrimages on Earth. Guarded by the sacred, unclimbed pyramid of Machapuchare (the Fishtail), this natural glacial basin sits at 4,130 meters above sea level.</p>
    <h2>The Mountain Gateways</h2>
    <p>As you ascend through dense rhododendron and moss-hung bamboo groves, the air sharpens. In spring, crimson blossoms cloak the hillsides, framing the icy spires above. Leaving the tree line behind at Deurali, the valley narrows into a dramatic canyon before expanding suddenly into the Sanctuary amphitheater.</p>
    <p>Surrounded 360 degrees by colossal ice walls—Annapurna South, Hiunchuli, Annapurna I, and Tent Peak—the landscape inspires profound silence. At dawn, first light gilds the jagged summit ridges in brilliant copper and gold.</p>`,
  },
  "secret-monasteries-upper-mustang": {
    title: "Sacred Murals of Upper Mustang: Centuries of Buddhist Art at 3,800m",
    excerpt: "Exploring medieval mud-brick alleyways, ancient royal palaces, and sacred sky caves with untouched 14th-century frescoes.",
    category: "Heritage",
    featured_image: "/images/mustang-cliffs.jpg",
    created_at: "2025-04-28T10:00:00Z",
    content: `<p>Tucked behind the rain shadow of the Annapurna and Dhaulagiri ranges lies the ancient Kingdom of Lo. Here, the landscape transitions from green alpine valleys to wind-carved desert canyons of ochre, crimson, and gold.</p>
    <h2>The Walled City of Lo Manthang</h2>
    <p>Founded in 1380 by Ame Pal, Lo Manthang remains enclosed within high whitewashed ramparts. Inside, stone-paved alleys wind between flat-roofed houses, chortens, and three majestic 15th-century gompas: Thubchen, Jampa, and Chode.</p>
    <p>Within these dark sanctuary halls, colossal golden statues of Maitreya Buddha gaze serenely across walls covered in intricate mandalas, masterfully painted by Newari and Tibetan artists centuries ago.</p>`,
  },
  "kathmandu-valley-living-history": {
    title: "Kathmandu Valley — Where Living History Lives in Stone & Timber",
    excerpt: "Centuries of Newari pagoda artistry, stone carving, and temple courtyards that have stood against earthquakes and time.",
    category: "Culture",
    featured_image: "/images/kathmandu-valley.jpg",
    created_at: "2025-04-25T10:00:00Z",
    content: `<p>Kathmandu Valley is a UNESCO World Heritage cradle where religion, craftsmanship, and daily life remain seamlessly intertwined. Across the three royal cities of Kathmandu, Patan, and Bhaktapur, multi-tiered pagodas rise over red brick plazas.</p>
    <h2>Mastery of Newari Architecture</h2>
    <p>The distinctive sloping roofs with terracotta tiles, carved wooden struts depicting protective deities, and intricate peacock windows reflect centuries of Newari artistic genius. In the courtyards of Patan, bronze casters still hammer sacred statues using lost-wax techniques perfected over a millennium ago.</p>`,
  },
  "hidden-trails-tilicho-gokyo": {
    title: "Hidden Glacial Trails of the Himalayas: High Passes & Sacred Waters",
    excerpt: "From high-altitude turquoise lakes to wind-swept cols, discovering the quiet trails beyond standard tourist routes.",
    category: "Expedition",
    featured_image: "/images/himalaya-trails.jpg",
    created_at: "2025-04-18T10:00:00Z",
    content: `<p>Far above the tree line, Nepal's glacial lakes offer some of the most surreal landscapes in the world. Tilicho Lake, resting at 4,919 meters in the Annapurna range, is fed directly by hanging glaciers from Tilicho Peak.</p>
    <h2>Mirror of the High Himalayas</h2>
    <p>The water shines with an otherworldly turquoise sheen, reflecting towering limestone crags and sheer ice cliffs. Traversing the high trails connecting Manang to Jomsom via the high passes tests endurance, but rewards trekkers with untouched wilderness and serene solitudes.</p>`,
  },
  "sagarmatha-sherpa-high-passes": {
    title: "Beneath Sagarmatha: The Monasteries & High Passes of Khumbu",
    excerpt: "Tengboche monastery bells, morning prayer horns, and ancient stone stupas framing the tallest peaks on Earth.",
    category: "Adventure",
    featured_image: "/images/himalaya-hero.jpg",
    created_at: "2025-04-08T10:00:00Z",
    content: `<p>In the high valleys of the Khumbu, the spirit of mountain exploration lives in harmony with ancient Tibetan Buddhist devotion. Stone mani walls inscribed with sacred mantras line the footpaths between Namche Bazaar and Everest Base Camp.</p>
    <h2>The Sacred Mountain</h2>
    <p>Known locally as Chomolungma ('Goddess Mother of the World') and Sagarmatha ('Goddess of the Sky'), the pyramid peak rises into the jet stream. From the ridge of Tengboche Monastery, with Ama Dablam soaring like a sculpted spire against cobalt skies, travelers experience the profound majesty of Nepal's high Himalaya.</p>`,
  },
  "beyond-momo-newari-gastronomy": {
    title: "Beyond Momo: The Ancient Fermentation & Spices of Newari Feasts",
    excerpt: "A deep dive into clay kiln traditions, slow-roasted choila, spiced beaten rice, and ceremonial Newari feasting culture.",
    category: "Food",
    featured_image: "/images/eug.jpg",
    created_at: "2025-04-12T10:00:00Z",
    content: `<p>Nepali cuisine is far more diverse than casual visitors imagine. At its cultural heart sits the intricate culinary heritage of the Newar people of the Kathmandu Valley.</p>
    <h2>The Anatomy of Samay Baji</h2>
    <p>A ceremonial Newari platter, Samay Baji represents the five elements: crispy beaten rice (baji), smoky barbecued buffalo or duck (choila), spicy black soybeans (bhatmas), ginger pickle, and slow-fermented greens (gundruk). Each dish balances bitter, pungent, savory, and sour notes in harmonic equilibrium.</p>`,
  },
};

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post = await getPostBySlug(slug);

  if (!post || post.status !== "PUBLISHED") {
    const fallback = showcaseStoriesContent[slug];
    if (fallback) {
      post = {
        id: 999,
        title: fallback.title,
        slug: slug,
        excerpt: fallback.excerpt,
        content: fallback.content,
        featured_image: fallback.featured_image,
        category: fallback.category,
        status: "PUBLISHED",
        author_id: 1,
        created_at: fallback.created_at,
        updated_at: fallback.created_at,
      };
    } else {
      notFound();
    }
  }

  return (
    <main className="min-h-screen bg-white px-6 py-14 dark:bg-zinc-950 sm:py-20">
      <article className="mx-auto max-w-3xl">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Blog
        </Link>

        {post.featured_image ? (
          <figure className="mt-8">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900">
              <Image
                src={post.featured_image}
                alt={post.title}
                width={1200}
                height={1200}
                className="object-cover"
                sizes="(min-width: 768px) 768px, 100vw"
                priority
              />
            </div>
          </figure>
        ) : null}

        <div className="mt-10 space-y-5 border-b border-zinc-200 pb-8 dark:border-zinc-800">
          <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            <span>{post.category}</span>
            <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="inline-flex items-center gap-1.5 normal-case tracking-normal">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(post.created_at)}
            </span>
          </div>

          <h1 className="font-serif text-3xl font-bold leading-[1.1] tracking-tight text-zinc-950 dark:text-white sm:text-4xl">
            {post.title}
          </h1>

          {post.excerpt ? (
            <p className="text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
              {post.excerpt}
            </p>
          ) : null}
        </div>

        <div
          className="prose prose-zinc mt-8 max-w-none prose-headings:font-serif prose-headings:font-bold prose-p:leading-relaxed prose-a:text-zinc-950 prose-a:underline prose-a:underline-offset-2 dark:prose-invert dark:prose-a:text-white"
          dangerouslySetInnerHTML={{ __html: cleanHtml(post.content) }}
        />
      </article>
    </main>
  );
}