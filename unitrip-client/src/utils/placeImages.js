import { destinationImage } from "@/utils/destinationImages";

const u = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

/** Distinct landmark photos. Keys are lowercase place names. */
const PLACE_IMAGES = {
  "taj mahal": u("1564507592333-c60657eea523"),
  "agra fort": u("1548013146-72479768bada"),
  "fatehpur sikri": u("1524492412937-b28074a5d7da"),
  "india gate": u("1587474260584-136574f4848d"),
  "rashtrapati bhavan & rajpath": u("1598091383021-15ddea10925d"),
  "connaught place": u("1582510003544-4d00bce9d8c3"),
  "jama masjid": u("1570168007204-dfb528c6958f"),
  "chandni chowk": u("1555939594-58d7cb561ad1"),
  "red fort": u("1598091383021-15ddea10925d"),
  "raj ghat": u("1524492412937-b28074a5d7da"),
  "humayun's tomb": u("1548013146-72479768bada"),
  "lodhi garden": u("1585320806297-9794b3e4eeae"),
  "purana qila": u("1598091383021-15ddea10925d"),
  "safdarjung tomb": u("1548013146-72479768bada"),
  "qutub minar": u("1587474260584-136574f4848d"),
  "qutub minar area stroll": u("1587474260584-136574f4848d"),
  "lotus temple": u("1605649487212-47bdab064df7"),
  "lotus temple viewpoint": u("1605649487212-47bdab064df7"),
  "akshardham temple": u("1605649487212-47bdab064df7"),
  "akshardham exterior": u("1605649487212-47bdab064df7"),
  "akshardham view point": u("1605649487212-47bdab064df7"),
  "bangla sahib gurudwara": u("1564769625905-50e93615e769"),
  "dilli haat ina": u("1555939594-58d7cb561ad1"),
  "garden of five senses": u("1585320806297-9794b3e4eeae"),
  "paranthe wali gali": u("1555939594-58d7cb561ad1"),
  "khari baoli spice market": u("1596040033229-a9821ebd058d"),
  "gali qasim jan haveli stop": u("1524492412937-b28074a5d7da"),
  "national museum": u("1566127444979-b3d2b654e3d7"),
  "mathura & vrindavan day trip": u("1582510003544-4d00bce9d8c3"),
  "mathura temple stop": u("1582510003544-4d00bce9d8c3"),
  "delhi airport t3": u("1436491865332-7a61a109cc05"),
  "cyber hub": u("1596176530529-78163a4f7af2"),
  "cyber hub gurugram": u("1596176530529-78163a4f7af2"),
  "kingdom of dreams exterior": u("1512453979798-5eabb7a4e0c0"),
  "ambience mall walk": u("1441986300917-64674bd600d8"),
  "noida sector 18 market": u("1441986300917-64674bd600d8"),
  "local guide assist (2 hrs)": u("1529156069898-49953e39b3ac"),
  "hawa mahal": u("1477587458883-47145ed94245"),
  "amber fort": u("1599661046289-e31897846e41"),
  "gateway of india": u("1529253355930-ddbe423a2ac7"),
  "elephanta ferry add-on assist": u("1507525428034-b723cf961d3e"),
  "city palace": u("1615836245337-f5b9b593e1a9"),
  "lake pichola boat ride": u("1615836245337-f5b9b593e1a9"),
  "mehrangarh fort": u("1626621341517-bbf3d9990a23"),
  "bishnoi village safari": u("1516426122078-c23e76319801"),
  "dudhsagar falls": u("1432405972618-c60b0225b8f9"),
  "spice plantation lunch stop": u("1596040033229-a9821ebd058d"),
  "dubai marina walk": u("1512453979798-5eabb7a4e0c0"),
  "burj khalifa at the top": u("1518684079-3c830dcef090"),
  "wat arun viewpoint": u("1563492065599-3520f775eeed"),
  "cloud forest dome entry": u("1525625293386-3f8f99389edd"),
};

export function placeImage(place) {
  const key = String(place?.name || "")
    .trim()
    .toLowerCase();
  if (PLACE_IMAGES[key]) return PLACE_IMAGES[key];
  if (place?.image && !/picsum\.photos/i.test(place.image)) return place.image;
  return destinationImage(place?.city, place?.image);
}
