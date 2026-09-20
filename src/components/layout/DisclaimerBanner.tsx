export function DisclaimerBanner() {
  return (
    <div className="border-b border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-center text-[11px] leading-snug text-amber-300 sm:px-6">
      Prototype basé sur des données climatiques historiques (1935-2014) et des projections (2015-2099) — pas de
      capteurs en temps réel. Les correspondances station ↔ localité sont indicatives (voir{" "}
      <span className="font-mono">data/DATA_QUALITY.md</span>). À valider avec les services hydrologiques compétents
      avant tout usage opérationnel.
    </div>
  );
}
