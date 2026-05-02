import Image from "next/image";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  body?: React.ReactNode;
  image?: string;
};

export function PageHero({ eyebrow, title, body, image = "/images/nordan-52.jpg" }: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image src={image} alt="" fill priority className="object-cover object-center" sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-[color:var(--color-nordan-dark)]/92 via-[color:var(--color-nordan-dark)]/82 to-[color:var(--color-nordan-dark)]/95" />
      </div>
      <div className="relative mx-auto max-w-7xl px-5 md:px-8 py-24 md:py-36 text-white">
        {eyebrow ? <div className="eyebrow !text-white/70 mb-5">{eyebrow}</div> : null}
        <h1 className="display-xl max-w-4xl">{title}</h1>
        {body ? <p className="mt-6 max-w-2xl text-lg md:text-xl text-white/85 leading-relaxed">{body}</p> : null}
      </div>
    </section>
  );
}
