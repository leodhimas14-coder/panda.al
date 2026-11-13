import { useConfig } from '../../context/ConfigContext';
import RichText from '../../lib/RichText';
export default function AboutPage() {
  const { pages } = useConfig();
  if (pages?.about) {
    return (
      <div className="container section narrow prose">
        <h1 className="page-title">Kush jemi</h1>
        <RichText text={pages.about} />
      </div>
    );
  }
  return (
    <div className="container section narrow prose">
      <h1 className="page-title">Kush jemi</h1>
      <p>Panda.al është dyqan online për kozmetikë dhe kujdes për lëkurën: kremra, maska fytyre, patch për sytë, serume dhe më shumë, kryesisht për femra, por edhe për meshkuj.</p>
      <p>Produktet i zgjedhim drejtpërdrejt te prodhuesit dhe i kontrollojmë një nga një në magazinën tonë para se t'i nisim: ambalazhin, vulën dhe afatin e përdorimit. Te çdo produkt shkruajmë përbërësit dhe si përdoret.</p>
      <p>Porositë i dorëzojmë në gjithë Shqipërinë dhe çdo porosi mund ta ndjekësh hap pas hapi, nga magazina deri te dera.</p>
    </div>
  );
}
