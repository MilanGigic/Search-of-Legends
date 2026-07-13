import Image from "next/image";
function findRuneInTree(
  tree: RuneStyle,
  perkId: number | null,
): Rune | undefined {
  if (perkId == null) return undefined;
  for (const slot of tree.slots) {
    const found = slot.runes.find((r) => r.id === perkId);
    if (found) return found;
  }
  return undefined;
}

/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
const RuneTable = ({
  participant,
  runesApi,
}: {
  participant: ParticipantData;
  runesApi: RuneStyle[];
}) => {
  return (
    <div>
      {participant.perks.styles.map((style, styleIndex) => {
        const runeTree = runesApi.find((r) => r.id === style.style);

        // Debug: Log the result

        return (
          <div key={styleIndex} className="">
            <h2 className="text-lg font-bold text-center flex flex-col items-center">
              <Image
                src={`https://raw.communitydragon.org/latest/game/assets/perks/styles/${runeTree?.icon
                  .replace("perk-images/Styles/", "")
                  .toLowerCase()!}`}
                alt={`${runeTree?.key}`}
                width={32}
                height={32}
                className="mb-0.5 w-6 h-6 sm:w-10 sm:h-10"
              />
            </h2>
            <div
              className={` ${
                style.description === "subStyle"
                  ? "flex w-full items-center gap-2 justify-center"
                  : "grid grid-cols-3 gap-2"
              }  mb-2`}
            >
              {style.selections.map((selection, selectionIndex) => {
                // Find the specific rune across all slots using flatMap
                const rune = findRuneInTree(runeTree!, selection.perk);
                if (!rune) return null;

                return (
                  <div
                    key={selectionIndex}
                    className={`${
                      selectionIndex === 0 && style.description !== "subStyle"
                        ? "col-span-3 flex flex-col items-center"
                        : ""
                    }`}
                  >
                    {rune ? (
                      <Image
                        src={`https://raw.communitydragon.org/latest/game/assets/perks/styles/${rune.icon
                          .replace("perk-images/Styles/", "")
                          .toLowerCase()}`}
                        alt={rune.key || `Rune ${selection.perk}`}
                        width={24}
                        height={24}
                        className={`rounded-full ${
                          selectionIndex === 0 &&
                          style.description !== "subStyle"
                            ? "w-[28px] h-[28px]"
                            : ""
                        }`}
                      />
                    ) : (
                      <div className="w-[24px] h-[24px] bg-gray-300 rounded-full border-2 border-white/20 flex items-center justify-center">
                        <span className="text-xs">?</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RuneTable;
