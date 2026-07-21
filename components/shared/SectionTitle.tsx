export default function SectionTitle({
  kicker,
  title,
  description,
}: {
  kicker?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {kicker ? <p className="premium-kicker">{kicker}</p> : null}
        <h2 className="section-title">{title}</h2>
        {description ? (
          <p className="section-description">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
