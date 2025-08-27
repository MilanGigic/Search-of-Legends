import validateMatchData from "./validateMatchData";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

export default async function checkDbGames(puuid: string, matchIds: string[]) {
  // Step 1: Enhanced input validation
  if (!puuid || typeof puuid !== "string" || puuid.trim().length === 0) {
    console.error("checkDbGames: Invalid puuid provided:", puuid);
    throw new Error("Invalid puuid - must be a non-empty string");
  }

  if (!Array.isArray(matchIds)) {
    console.error("checkDbGames: matchIds is not an array:", matchIds);
    throw new Error("matchIds must be an array");
  }

  if (matchIds.length === 0) {
    console.warn("checkDbGames: Empty matchIds array provided");
    return {
      foundMatches: [],
      missingMatchIds: [],
      stats: { totalRequested: 0, foundInDb: 0, needToFetch: 0 },
    };
  }

  // Step 2: Validate each match ID
  const invalidMatchIds = matchIds.filter(
    (id) => typeof id !== "string" || id.trim().length === 0
  );

  if (invalidMatchIds.length > 0) {
    console.error("checkDbGames: Invalid match IDs found:", invalidMatchIds);
    throw new Error(
      `Invalid match IDs: ${invalidMatchIds.length} IDs are not valid strings`
    );
  }

  try {
    // Step 4: Construct and validate URL
    let url: string;
    try {
      url = `/api/check-db-games?puuid=${encodeURIComponent(
        puuid
      )}&matchIds=${encodeURIComponent(JSON.stringify(matchIds))}`;
    } catch (urlError) {
      console.error("checkDbGames: Error constructing URL:", urlError);
      throw new Error("Failed to construct request URL");
    }

    console.log("Fetching URL:", url.substring(0, 100) + "...");

    // Step 5: Make request with timeout and proper error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.error("checkDbGames: Request timeout after 15 seconds");
    }, 15000);

    let res: Response;
    try {
      res = await fetch(url, {
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);

      if (fetchError === "AbortError") {
        throw new Error("Request timeout - database check took too long");
      }

      console.error("checkDbGames: Network error:", fetchError);
      throw new Error(`Network error: ${fetchError}`);
    }

    clearTimeout(timeoutId);
    console.log("Fetch response status:", res.status);

    // Step 6: Validate response status
    if (!res.ok) {
      let errorMessage = `HTTP ${res.status}: ${res.statusText}`;

      // Try to get more detailed error from response body
      try {
        const errorBody = await res.text();
        if (errorBody) {
          const errorData = JSON.parse(errorBody);
          errorMessage = errorData.error || errorMessage;
        }
      } catch (parseError) {
        console.warn("Could not parse error response body");
      }

      console.error("checkDbGames: HTTP error:", errorMessage);
      throw new Error(`Failed to check matches: ${errorMessage}`);
    }

    // Step 7: Parse and validate response JSON
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let responseData: any;
    try {
      responseData = await res.json();
    } catch (parseError) {
      console.error("checkDbGames: JSON parse error:", parseError);
      throw new Error("Invalid JSON response from server");
    }

    // Step 8: Validate response structure
    if (!responseData || typeof responseData !== "object") {
      console.error("checkDbGames: Invalid response data:", responseData);
      throw new Error("Invalid response data structure");
    }

    const { foundMatches, missingMatchIds, stats } = responseData;

    // Step 9: Validate foundMatches array
    if (!Array.isArray(foundMatches)) {
      console.error(
        "checkDbGames: foundMatches is not an array:",
        foundMatches
      );
      throw new Error("Invalid foundMatches data - expected array");
    }

    // Step 10: Validate missingMatchIds array
    if (!Array.isArray(missingMatchIds)) {
      console.error(
        "checkDbGames: missingMatchIds is not an array:",
        missingMatchIds
      );
      throw new Error("Invalid missingMatchIds data - expected array");
    }

    // Step 11: Validate each found match structure
    const validFoundMatches: DbGameInfo[] = [];
    const invalidMatches = [];

    foundMatches.forEach((match, index) => {
      if (!match || typeof match !== "object") {
        console.warn(
          `checkDbGames: Invalid match object at index ${index}:`,
          match
        );
        invalidMatches.push(index);
        return;
      }

      // Validate essential match properties
      const validationResult = validateMatchData(match, index);

      if (validationResult.isValid) {
        validFoundMatches.push(match);
      } else {
        console.warn(
          `checkDbGames: Match validation failed at index ${index}:`,
          validationResult.errors
        );
        invalidMatches.push(index);
      }
    });

    if (invalidMatches.length > 0) {
      console.warn(
        `checkDbGames: ${invalidMatches.length} matches failed validation`
      );
    }

    // Step 12: Validate missing match IDs
    const validMissingMatchIds = missingMatchIds.filter(
      (id) => typeof id === "string" && id.trim().length > 0
    );

    if (validMissingMatchIds.length !== missingMatchIds.length) {
      console.warn(
        `checkDbGames: Filtered ${
          missingMatchIds.length - validMissingMatchIds.length
        } invalid missing match IDs`
      );
    }

    // Step 13: Cross-validation - ensure no overlap between found and missing
    const foundMatchIds = validFoundMatches
      .map((match) => match.info?.matchId)
      .filter(Boolean);

    const overlappingIds = validMissingMatchIds.filter((id) =>
      foundMatchIds.includes(id)
    );

    if (overlappingIds.length > 0) {
      console.error(
        "checkDbGames: Found overlapping IDs between found and missing:",
        overlappingIds
      );
    }

    // Step 14: Validate totals match input
    const totalFound = validFoundMatches.length;
    const totalMissing = validMissingMatchIds.length;
    const totalProcessed = totalFound + totalMissing;

    if (totalProcessed !== matchIds.length) {
      console.warn(
        `checkDbGames: Total processed (${totalProcessed}) doesn't match input (${matchIds.length})`
      );
    }

    console.log("checkDbGames: Validation complete", {
      foundMatches: totalFound,
      missingMatchIds: totalMissing,
      invalidMatches: invalidMatches.length,
      totalRequested: matchIds.length,
    });

    // Step 15: Return validated data
    return {
      foundMatches: validFoundMatches,
      missingMatchIds: validMissingMatchIds,
      stats: {
        totalRequested: matchIds.length,
        foundInDb: totalFound,
        needToFetch: totalMissing,
        invalidCount: invalidMatches.length,
        completionRate:
          matchIds.length > 0
            ? ((totalFound / matchIds.length) * 100).toFixed(1) + "%"
            : "0%",
      },
    };
  } catch (error) {
    console.error("checkDbGames: Error occurred:", error);

    // Step 16: Enhanced error handling with context
    if (error instanceof Error) {
      // Re-throw with additional context
      throw new Error(`Database check failed: ${error.message}`);
    }
  }
}
