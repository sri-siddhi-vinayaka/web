import type { Metadata } from "next";
import type { ComponentType, ReactNode } from "react";
import VinayakaIcon from "@/components/icons/VinayakaIcon";
import CrownIcon from "@/components/icons/CrownIcon";
import ModakIcon from "@/components/icons/ModakIcon";
import MouseIcon from "@/components/icons/MouseIcon";
import LotusIcon from "@/components/icons/LotusIcon";
import ConchIcon from "@/components/icons/ConchIcon";
import ScrollIcon from "@/components/icons/ScrollIcon";

export const metadata: Metadata = {
  title: "About Ganesha",
  description:
    "Who is Ganesha, why he has an elephant head, why modak and a mouse matter, his 32 forms, and the mantras families chant during Ganesh Chaturthi — written for kids and the grown-ups reading along.",
};

const FORMS: { name: string; blurb: string }[] = [
  { name: "Bala Ganapati", blurb: "The small child form, playfully holding fruits and sweets." },
  { name: "Taruna Ganapati", blurb: "The youthful form, calm and glowing with quiet strength." },
  { name: "Bhakti Ganapati", blurb: "The devoted form, worshipped for pure love and faith." },
  { name: "Veera Ganapati", blurb: "The heroic, warrior form — brave and unshaken." },
  { name: "Shakti Ganapati", blurb: "The powerful form, seated beside his energy." },
  { name: "Dwija Ganapati", blurb: "The \"twice-born\" form, shown with four heads for wisdom from every direction." },
  { name: "Siddhi Ganapati", blurb: "The accomplished form, granter of success in any effort." },
  { name: "Ucchishta Ganapati", blurb: "A form linked to less conventional, esoteric traditions of worship." },
  { name: "Vighna Ganapati", blurb: "The form who both places and removes obstacles — a reminder that challenges have a purpose." },
  { name: "Kshipra Ganapati", blurb: "The swift form, answering prayers quickly." },
  { name: "Heramba Ganapati", blurb: "The protector form, often shown with five heads, guarding the weak." },
  { name: "Lakshmi Ganapati", blurb: "The form paired with fortune and prosperity." },
  { name: "Maha Ganapati", blurb: "The \"great\" form — radiant and richly adorned." },
  { name: "Vijaya Ganapati", blurb: "The victorious form, celebrated after any hard-won success." },
  { name: "Nritya Ganapati", blurb: "The dancing form, joyful and full of movement." },
  { name: "Urdhva Ganapati", blurb: "The \"upward-facing\" form, associated with spiritual elevation." },
  { name: "Ekakshara Ganapati", blurb: "The form linked to a single sacred syllable, \"Gam.\"" },
  { name: "Varada Ganapati", blurb: "The boon-giving form, hand raised in blessing." },
  { name: "Tryakshara Ganapati", blurb: "The form linked to the three-syllable mantra \"Om.\"" },
  { name: "Kshipra Prasada Ganapati", blurb: "The form who grants blessings without delay." },
  { name: "Haridra Ganapati", blurb: "The golden, turmeric-colored form, tied to healing and auspiciousness." },
  { name: "Ekadanta Ganapati", blurb: "The single-tusked form, recalling the story of his broken tusk." },
  { name: "Srishti Ganapati", blurb: "The form associated with creation and new beginnings." },
  { name: "Uddanda Ganapati", blurb: "The upright, disciplined form, holding symbols of authority." },
  { name: "Rinamochana Ganapati", blurb: "The form prayed to for release from debts, literal or otherwise." },
  { name: "Dhundhi Ganapati", blurb: "A form especially worshipped in the holy city of Varanasi." },
  { name: "Dwimukha Ganapati", blurb: "The two-faced form, able to watch in two directions at once." },
  { name: "Trimukha Ganapati", blurb: "The three-faced form, watchful in every direction." },
  { name: "Simha Ganapati", blurb: "The form seated on a lion instead of his usual mouse, showing courage." },
  { name: "Yoga Ganapati", blurb: "The meditating form, seated in stillness and balance." },
  { name: "Durga Ganapati", blurb: "The form linked with the goddess Durga's protective strength." },
  { name: "Sankatahara Ganapati", blurb: "The form who removes sankata — trouble and distress — from his devotees' lives." },
];

const MANTRAS: { title: string; transliteration: string; meaning: string; context: string }[] = [
  {
    title: "The Mool (Root) Mantra",
    transliteration: "Om Gan Ganapataye Namah",
    meaning: "“I bow to Ganapati.”",
    context:
      "Short, simple, and easy for even young children to learn — often the very first Ganesha mantra a family teaches.",
  },
  {
    title: "Vakratunda Mahakaya",
    transliteration:
      "Vakratunda Mahakaya Suryakoti Samaprabha, Nirvighnam Kuru Me Deva Sarva-Kaaryeshu Sarvada",
    meaning:
      "“O Lord with the curved trunk and mighty body, whose glow rivals a million suns — please clear every obstacle from all my efforts, always.”",
    context:
      "Traditionally the first thing many people say before starting something important — an exam, a trip, a new task.",
  },
  {
    title: "Ganesha Gayatri Mantra",
    transliteration: "Om Ekadantaya Vidmahe, Vakratundaya Dhimahi, Tanno Danti Prachodayat",
    meaning:
      "“We meditate on the one-tusked lord; we contemplate the one with the curved trunk; may that tusked one inspire and guide us.”",
    context: "A quieter, meditative chant, often used at the start of learning or study.",
  },
  {
    title: "The Visarjan Chant",
    transliteration: "Ganpati Bappa Morya, Pudhchya Varshi Lavkarya",
    meaning:
      "In Marathi, roughly “Beloved Father Ganesha, come back again next year — and come soon!”",
    context:
      "Sung joyfully during visarjan, the procession that sends Ganesha's murti off at the end of the festival — the one every kid ends up singing by the end of the day.",
  },
];

type Chapter = { title: string; paragraphs: string[] };

// Four more traditional tales, told alongside the birth/elephant-head story
// during Ganesh Chaturthi — the rest of the vratha-katha set most Telugu
// Vinayaka Vratha Kalpam booklets carry. English only for now; multi-language
// support for this page was explored and deferred — see AGENTS.md.
const MORE_STORIES: Chapter[] = [
  {
    title: "Why Ganesha Is Worshipped First",
    paragraphs: [
      "Once, the sages and gods fell into a friendly argument: between the two sons of Shiva and Parvati — Ganesha and his brother Kartikeya (also called Subramanya) — who deserved to be worshipped first, before any other god? To settle it, their parents set a contest: whoever traveled around the three worlds and returned home first would win.",
      "Kartikeya, quick and eager, leapt onto his peacock and shot off across the universe without a second thought. Ganesha looked down at his own little mouse, then at his parents standing right in front of him, and smiled. He simply walked in a slow circle around Shiva and Parvati and said, \"You two are my whole world — I don't need to look any further than this.\"",
      "Everyone watching was moved by the answer, and Shiva and Parvati declared Ganesha the winner on the spot. From that day on, Ganesha was given the honor of Agra Puja — the very first worship — which is why, even now, no pooja begins without his name being called first, no matter which god the rest of the ceremony is for.",
    ],
  },
  {
    title: "The Feast at Kubera's Palace",
    paragraphs: [
      "Kubera, the god of wealth, was proud of his treasures, and one day he invited young Ganesha to a grand feast, hoping to impress him with just how much he owned. Ganesha arrived hungry and began to eat — and eat, and eat. He finished every dish in the kitchen, then the food being prepared for the next day, and still asked for more. Panicking, Kubera offered him the gold plates, the silver bowls, the furniture — anything to satisfy him — but Ganesha's hunger only grew.",
      "Terrified that Ganesha might eat his entire palace, Kubera ran to Shiva and begged for help. Shiva only smiled and sent a small handful of ordinary roasted rice, offered with love by Parvati. The moment Ganesha ate that one humble handful, he was completely full and satisfied — something all of Kubera's riches together couldn't do.",
      "Kubera understood then that it wasn't the size of an offering that mattered, but the devotion behind it — a lesson every family remembers when they offer Ganesha something as simple as a few modaks with a full heart.",
    ],
  },
  {
    title: "The Broken Tusk",
    paragraphs: [
      "One afternoon, the sage Parashurama came to Mount Kailash to visit Shiva, but found young Ganesha guarding the entrance while his father rested. When Ganesha wouldn't let him pass, an argument broke out, and Parashurama — quick-tempered — hurled his axe at him. Ganesha recognized the axe at once: it had been a gift from his own father to Parashurama, long ago. Out of respect for his father's weapon, Ganesha chose not to dodge, and let it strike his left tusk, breaking it clean off.",
      "That's why you'll almost always see Ganesha pictured with one full tusk and one broken one — a reminder, families say, that Ganesha valued respect over his own comfort. (Some tellings give the tusk a different origin — that he broke it himself to use as a pen while writing down the great epic, the Mahabharata, as the sage Vyasa recited it aloud. Either way, the broken tusk — Ekadanta — has become one of his most recognizable features.)",
    ],
  },
  {
    title: "The Moon's Curse and Krishna's Story",
    paragraphs: [
      "After the feast at Kubera's palace, a very full Ganesha climbed onto his little mouse to ride home under the night sky. Along the way, the mouse stumbled over a snake hiding in the path, and Ganesha tumbled straight off, his belly bursting open and spilling out every modak he'd just eaten. Without any fuss, Ganesha simply gathered the sweets back into his belly and tied the very same snake around his waist like a belt to hold everything in place, then carried on his way.",
      "Watching from the sky, the moon god, Chandra, couldn't help himself — he burst out laughing at the sight. Ganesha, stung by being mocked, declared that anyone who looked up at the moon on this night, the night of Ganesh Chaturthi, would face false blame for something they hadn't done. Chandra, immediately regretful, begged for forgiveness, and Ganesha softened the curse: instead of vanishing forever, the moon would simply dim on this one night each year, and people would learn to avoid looking up at it on this particular day.",
      "Years later, even Lord Krishna forgot this warning and happened to glance at the moon on Ganesh Chaturthi. Soon after, he found himself falsely blamed for stealing a precious jewel, the Syamantaka. Realizing what had caused it, Krishna sought out the story of Ganesha's curse, listened to it with full devotion, and performed the proper prayers — and before long, his name was cleared and the true thief was found.",
      "That's why, to this day, many families are careful not to look at the moon on the night of Ganesh Chaturthi — and if they happen to glance up anyway, they simply read this very story to set things right again.",
    ],
  },
];

const MORE_STORIES_EPILOGUE =
  "That's the story families have been telling for generations — around kitchen tables, at bedtime, and every year during Ganesh Chaturthi, when we welcome Ganesha into our homes all over again.";

function GaneshaHeroArt() {
  return (
    <div className="relative mx-auto flex h-28 w-28 items-center justify-center sm:h-32 sm:w-32">
      <LotusIcon className="absolute inset-0 h-full w-full text-primary/30" />
      <VinayakaIcon className="relative h-16 w-16 text-brand sm:h-20 sm:w-20" />
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

// Each topic is a native <details> row: zero JS, a 44px+ tap target, and the
// browser natively opens it when a URL fragment (e.g. #32-forms) targets an
// element inside it.
function Topic({
  id,
  title,
  Icon,
  children,
}: {
  id: string;
  title: string;
  Icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <details
      id={id}
      className="group scroll-mt-16 overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border [&::-webkit-details-marker]:hidden"
    >
      <summary className="flex min-h-16 cursor-pointer select-none list-none items-center gap-3 px-4 py-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-muted ring-1 ring-border">
          <Icon className="h-6 w-6 text-brand" />
        </span>
        <span className="flex-1 text-base font-semibold text-foreground">{title}</span>
        <Chevron className="h-5 w-5 shrink-0 text-muted transition-transform group-open:rotate-90" />
      </summary>
      <div className="flex flex-col gap-3 border-t border-border px-4 py-4">{children}</div>
    </details>
  );
}

function TeachesUs({ children }: { children: ReactNode }) {
  return (
    <div className="mt-3 rounded-2xl bg-surface-muted p-4 ring-1 ring-border">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        What it teaches us
      </p>
      <p className="mt-1 text-sm text-muted">{children}</p>
    </div>
  );
}

// One language's full chapter list + epilogue, rendered inside its own
// peer-checked panel. Kept as a named function (not inlined per-language)
// so the seven near-identical blocks below stay short.
export default function AboutGaneshaPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-bold text-brand">About Ganesha</h1>

      <div className="mt-6 flex flex-col gap-3">
        <Topic id="who-is-ganesha" title="Who Is Ganesha?" Icon={CrownIcon}>
          <p className="text-sm text-muted">
            Long ago, the goddess Parvati wanted a child of her own to keep
            her company while her husband, Shiva, was away meditating in the
            mountains. She shaped a little boy out of turmeric paste and
            clay, and breathed life into him. She named him Ganesha and
            loved him at once.
          </p>
          <p className="text-sm text-muted">
            Today, Ganesha is one of the most loved gods in Hindu tradition —
            the remover of obstacles (Vighnaharta) and the lord of new
            beginnings (Vinayaka). Before starting anything new — a school
            year, a wedding, a business, even a letter — many families pray
            to Ganesha first, so the path ahead is clear. Ganesh Chaturthi,
            the festival this whole site is about, celebrates the day he was
            born.
          </p>
          <p className="text-sm text-muted">
            He&apos;s the son of Shiva and Parvati, and brother to Kartikeya
            (also known as Subramanya) — though which of the two brothers is
            older is something families
            in different parts of India will happily debate!
          </p>
          <TeachesUs>
            It&apos;s traditional to think of Ganesha before starting
            something new — a small reminder to pause and set a good
            intention before jumping in.
          </TeachesUs>
        </Topic>

        <Topic id="elephant-head" title="Why an Elephant Head?" Icon={VinayakaIcon}>
          <p className="text-sm text-muted">
            One day, Parvati asked young Ganesha to guard the door while she
            bathed, and to let no one in. Soon after, Shiva came home — but
            he&apos;d never met this boy before, and Ganesha, taking his job
            seriously, wouldn&apos;t let even his own father pass! An
            argument turned into a fight, and in the heat of the moment,
            Shiva struck off the boy&apos;s head.
          </p>
          <p className="text-sm text-muted">
            When Parvati saw what happened, she was heartbroken, and Shiva
            realized his mistake. He sent his attendants out with one order:
            bring back the head of the very first creature you find. They
            returned with the head of an elephant — and Shiva placed it
            gently onto the boy&apos;s shoulders and breathed him back to
            life. From that day on, the boy who&apos;d guarded the door
            became Ganesha, exactly as we know him today.
          </p>
          <p className="text-sm text-muted">
            (Families tell this story a few different ways — some say the
            elephant was found sleeping facing north, others tell it
            differently — but the ending is always the same: an elephant
            head becomes part of who Ganesha is.)
          </p>
          <TeachesUs>
            An elephant&apos;s ears are enormous, its eyes are small, and its
            trunk can uproot a tree or pick up a single flower petal just as
            easily. Ganesha&apos;s head reminds us to listen more than we
            speak, to look past the surface, and that real strength includes
            gentleness.
          </TeachesUs>
        </Topic>

        <Topic
          id="more-stories"
          title="More Stories from the Festival"
          Icon={ScrollIcon}
        >
          <GaneshaHeroArt />
          <p className="text-xs text-muted">
            Ganesha&apos;s birth and his elephant head are already covered in
            their own sections above — these four more tales are the ones
            told alongside them each year during Ganesh Chaturthi.
          </p>
          {MORE_STORIES.map((chapter) => (
            <div key={chapter.title}>
              <h3 className="text-sm font-semibold text-brand">{chapter.title}</h3>
              <div className="mt-1.5 flex flex-col gap-2">
                {chapter.paragraphs.map((para, i) => (
                  <p key={i} className="text-sm text-muted">{para}</p>
                ))}
              </div>
            </div>
          ))}
          <p className="text-sm text-muted">{MORE_STORIES_EPILOGUE}</p>
        </Topic>

        <Topic id="modak" title="Why Modak?" Icon={ModakIcon}>
          <p className="text-sm text-muted">
            Modak — a sweet dumpling of coconut and jaggery wrapped in a
            soft rice-flour shell — is famously Ganesha&apos;s favorite
            food. One story says his mother, Parvati, made a huge batch of
            modaks and set them aside as a special treat. When Ganesha
            found them, he was so delighted that he ate one after another
            after another, until his belly grew round and full — exactly
            the way you see him drawn and sculpted today, holding a modak in
            his trunk or hand, saving just one more for later.
          </p>
          <TeachesUs>
            The outer rice shell of a modak is plain, but the sweet filling
            inside is the real reward — many say it&apos;s a little like
            knowledge itself: a bit of effort to unwrap it, and something
            genuinely sweet waiting inside. It&apos;s also simply why
            families offer Ganesha a plate of his favorite sweet during the
            festival.
          </TeachesUs>
        </Topic>

        <Topic id="mouse" title="Why a Mouse?" Icon={MouseIcon}>
          <p className="text-sm text-muted">
            Ganesha&apos;s companion and vehicle (vahana) is a mouse named
            Mushika. One telling says Mushika was once a proud spirit who
            went around causing trouble — knocking things over, refusing to
            make way for anyone — until he crashed straight into a sage and
            was cursed to become a mouse. As a giant mouse, he kept causing
            chaos, until Ganesha caught him, calmed him down, and offered
            him a place beside him instead of a punishment. Grateful,
            Mushika became Ganesha&apos;s lifelong friend and ride.
          </p>
          <TeachesUs>
            It&apos;s easy to picture the biggest of the gods riding the
            smallest of animals as a bit of a joke — but it&apos;s really the
            opposite. A mouse can nibble away at anything, the way small
            worries or wants can nibble away at us if we&apos;re not
            careful. Ganesha, seated calmly on top, shows he&apos;s always
            fully in control of his.
          </TeachesUs>
        </Topic>

        <Topic id="32-forms" title="32 Forms of Ganesha" Icon={LotusIcon}>
          <p className="text-sm text-muted">
            Ganesha is worshipped in many forms across India, each with its
            own mood, story, and blessing. One well-known list, the
            Dwatrimshad Ganapati (&ldquo;thirty-two Ganapatis&rdquo;), gives
            him thirty-two distinct forms. Tap below to see all of them — a
            fun one to explore together, picking a favorite by name.
          </p>
          <p className="text-xs text-muted">
            Names, order, and details vary a little between regions and
            texts — this list is a friendly starting point, not the only
            telling.
          </p>
          <details className="mt-1">
            <summary className="cursor-pointer select-none rounded-lg bg-surface-muted px-4 py-3 text-sm font-medium text-foreground ring-1 ring-border">
              See all 32 forms
            </summary>
            <dl className="mt-3 flex flex-col gap-2">
              {FORMS.map((form, index) => (
                <div key={form.name} className="rounded-xl bg-surface-muted p-3 ring-1 ring-border">
                  <dt className="text-sm font-semibold text-foreground">
                    {index + 1}. {form.name}
                  </dt>
                  <dd className="mt-0.5 text-sm text-muted">{form.blurb}</dd>
                </div>
              ))}
            </dl>
          </details>
        </Topic>

        <Topic id="mantras-slokas" title="Ganesha Mantras & Slokas" Icon={ConchIcon}>
          <p className="text-sm text-muted">
            Mantras are short chants — a nice one to practice out loud with
            kids, since saying them together is half the fun. Written here
            in Roman letters (transliteration) rather than Devanagari script,
            so anyone can read them aloud right away.
          </p>
          <div className="flex flex-col gap-3">
            {MANTRAS.map((mantra) => (
              <div key={mantra.title} className="rounded-xl bg-surface-muted p-3 ring-1 ring-border">
                <p className="text-sm font-semibold text-brand">{mantra.title}</p>
                <p className="mt-1 font-mono text-sm text-foreground">{mantra.transliteration}</p>
                <p className="mt-2 text-sm text-muted">{mantra.meaning}</p>
                <p className="mt-2 text-xs text-muted">{mantra.context}</p>
              </div>
            ))}
          </div>
        </Topic>
      </div>

      <p className="mt-8 text-xs text-muted">
        Traditions and tellings vary across regions and families — if you
        grew up with a different version of one of these stories, that&apos;s
        part of what makes this festival rich. This page is meant as a
        friendly starting point for kids (and grown-ups) new to
        Ganesha&apos;s stories.
      </p>
    </div>
  );
}
