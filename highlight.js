async function fetchHighlights(pdfId) {
  try {
    const response = await fetch(`/highlights/${pdfId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // Include credentials for session cookies
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error("Failed to fetch highlights");
    }
  } catch (error) {
    console.error("Error fetching highlights:", error);
    return null;
  }
}
async function sendHighlightsToServer({ masterHighlights, pageHighlights }) {
  console.log("sending highlights to server", masterHighlights, pageHighlights);
  try {
    const response = await fetch(`/highlights/${pdfId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pdfId,
        userId,
        masterHighlights,
        pageHighlights,
      }),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const updatedHighlightData = await response.json();
    console.log("Successfully updated highlights:", updatedHighlightData);
  } catch (error) {
    console.error("Error sending updated highlights:", error);
  }
}
