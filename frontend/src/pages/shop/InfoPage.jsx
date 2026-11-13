import { useConfig } from '../../context/ConfigContext';
import RichText from '../../lib/RichText';
import { lek } from '../../lib/format';

export default function InfoPage() {
  const { pages, shipping, payments } = useConfig();
  if (pages?.info) {
    return (
      <div className="container section narrow prose">
        <h1 className="page-title">Dërgesa dhe pagesa</h1>
        <RichText text={pages.info} />
      </div>
    );
  }
  return (
    <div className="container section narrow prose">
      <h1 className="page-title">Dërgesa dhe pagesa</h1>
      <h3>Sa zgjat dërgesa?</h3>
      <p>Produktet me shenjën <b>"Gati në Shqipëri"</b> dorëzohen për {shipping.localText}. Produktet e tjera vijnë nga magazina jonë dhe dorëzohen zakonisht për {shipping.chinaText}.</p>
      <h3>Si paguaj?</h3>
      {payments.card && <p>Me kartë (Visa ose Mastercard) në momentin e porosisë, përmes faqes së sigurt të bankës. Ne nuk i shohim të dhënat e kartës.</p>}
      {payments.cod && <p>Me para në dorë kur të merrni porosinë.</p>}
      <h3>Sa kushton transporti?</h3>
      <p>
        Transporti kushton {lek(shipping.fee)}
        {shipping.freeFrom > 0 && <>, dhe është <b>falas</b> për porosi mbi {lek(shipping.freeFrom)}</>}.
      </p>
      <h3>Mund ta kthej një produkt?</h3>
      <p>Po, brenda 14 ditëve nga marrja, nëse produkti nuk është hapur dhe ka ende ambalazhin dhe vulën origjinale. Për arsye higjiene, kozmetika e hapur nuk kthehet. Na shkruani me numrin e porosisë.</p>
      <h3>Po nëse më shkakton acarim?</h3>
      <p>Provojeni fillimisht në një pjesë të vogël të lëkurës (p.sh. pas veshit) dhe prisni 24 orë. Nëse keni alergji, lexoni përbërësit te faqja e produktit para se ta blini.</p>
      <h3>Po nëse produkti vjen i dëmtuar?</h3>
      <p>Na dërgoni foto brenda 48 orëve dhe ne e zëvendësojmë ose ju kthejmë paratë.</p>
    </div>
  );
}
