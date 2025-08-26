interface ValidationResult {
  isValid: boolean;
  errors: string[];
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Validates a match data object to ensure it has the required structure and valid data
 * @param match - The match object to validate
 * @param index - The index of the match in the array (for error reporting)
 * @returns ValidationResult object with validation status and any errors
 */
function validateMatchData(match: any, index: number): ValidationResult {
  const errors: string[] = [];

  // Step 1: Check if match is an object
  if (!match || typeof match !== "object") {
    return {
      isValid: false,
      errors: [`Match at index ${index} is not a valid object`],
    };
  }

  // Step 2: Validate the 'info' property (most critical)
  if (!match.info || typeof match.info !== "object") {
    errors.push(`Match at index ${index} missing or invalid 'info' property`);
  } else {
    // Step 3: Validate essential info properties
    const requiredInfoProps = [
      { key: "matchId", type: "string", required: true },
      { key: "gameCreation", type: "timestamp", required: true },
      { key: "gameMode", type: "string", required: true },
      { key: "gameType", type: "string", required: true },
      { key: "gameVersion", type: "string", required: true },
      { key: "mapId", type: "number", required: true },
      { key: "queueId", type: "number", required: true },
    ];

    requiredInfoProps.forEach((prop) => {
      const value = match.info[prop.key];

      if (prop.required && (value === undefined || value === null)) {
        errors.push(
          `Match at index ${index} missing required info.${prop.key}`
        );
      } else if (value !== undefined && value !== null) {
        // Step 4: Type validation
        if (
          prop.type === "string" &&
          (typeof value !== "string" || value.trim().length === 0)
        ) {
          errors.push(
            `Match at index ${index} has invalid info.${prop.key} (expected non-empty string)`
          );
        } else if (
          prop.type === "number" &&
          (typeof value !== "number" || isNaN(value))
        ) {
          errors.push(
            `Match at index ${index} has invalid info.${prop.key} (expected number)`
          );
        }
      }
    });

    // Step 5: Additional validation for specific fields
    if (match.info.matchId && match.info.matchId.length < 10) {
      errors.push(`Match at index ${index} has suspiciously short matchId`);
    }
  }

  // Step 6: Validate participants array (if present)
  if (match.participants !== undefined) {
    if (!Array.isArray(match.participants)) {
      errors.push(
        `Match at index ${index} has invalid participants (expected array)`
      );
    } else {
      // Step 7: Validate each participant
      match.participants.forEach((participant: any, pIndex: number) => {
        if (!participant || typeof participant !== "object") {
          errors.push(
            `Match at index ${index} has invalid participant at index ${pIndex}`
          );
          return;
        }

        const requiredParticipantProps = [
          { key: "puuid", type: "string" },
          { key: "participantId", type: "number" },
          { key: "teamId", type: "number" },
          { key: "championId", type: "number" },
        ];

        requiredParticipantProps.forEach((prop) => {
          const value = participant[prop.key];
          if (value === undefined || value === null) {
            errors.push(
              `Match at index ${index} participant ${pIndex} missing ${prop.key}`
            );
          } else if (
            prop.type === "string" &&
            (typeof value !== "string" || value.trim().length === 0)
          ) {
            errors.push(
              `Match at index ${index} participant ${pIndex} has invalid ${prop.key}`
            );
          } else if (
            prop.type === "number" &&
            (typeof value !== "number" || isNaN(value))
          ) {
            errors.push(
              `Match at index ${index} participant ${pIndex} has invalid ${prop.key}`
            );
          }
        });
      });

      // Step 8: Validate participant count (should be 10 for most game modes)
      if (match.participants.length !== 10 && match.participants.length !== 6) {
        errors.push(
          `Match at index ${index} has unexpected participant count: ${match.participants.length}`
        );
      }
    }
  }

  // Step 9: Validate teams array (if present)
  if (match.teams !== undefined) {
    if (!Array.isArray(match.teams)) {
      errors.push(`Match at index ${index} has invalid teams (expected array)`);
    } else {
      // Step 10: Validate each team
      match.teams.forEach((team: any, tIndex: number) => {
        if (!team || typeof team !== "object") {
          errors.push(
            `Match at index ${index} has invalid team at index ${tIndex}`
          );
          return;
        }

        if (typeof team.teamId !== "number") {
          errors.push(
            `Match at index ${index} team ${tIndex} has invalid teamId`
          );
        }

        if (typeof team.win !== "number") {
          errors.push(
            `Match at index ${index} team ${tIndex} has invalid win property`
          );
        }
      });

      // Step 11: Validate team count (should be 2 for most game modes)
      if (match.teams.length !== 2) {
        errors.push(
          `Match at index ${index} has unexpected team count: ${match.teams.length}`
        );
      }
    }
  }

  // Step 12: Cross-validation between participants and teams
  if (match.participants && match.teams) {
    const participantTeamIds = new Set(
      match.participants.map((p: any) => p.teamId)
    );
    const teamIds = new Set(match.teams.map((t: any) => t.teamId));

    // Check if all participant team IDs exist in teams
    participantTeamIds.forEach((teamId) => {
      if (!teamIds.has(teamId)) {
        errors.push(
          `Match at index ${index} has participant with teamId ${teamId} but no corresponding team`
        );
      }
    });
  }

  // Step 14: Return validation result
  return {
    isValid: errors.length === 0,
    errors: errors,
  };
}

export default validateMatchData;
