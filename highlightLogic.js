// import "./highlight.css";
import { v4 as uuidv4 } from "uuid";

let pageHighlights = {};
let masterHighlights = {};
let color;

function createHighlight(masterHighlightsArg, pageHighlightsArg, colorArg) {
  masterHighlights = masterHighlightsArg;
  pageHighlights = pageHighlightsArg;
  color = colorArg;
  console.log("pageHighlights: ", pageHighlights);
  console.log("masterHighlights: ", masterHighlights);
  const selection = window.getSelection();

  // if (selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  // if (range.collapsed) return;

  const startContainer = range.startContainer;
  const endContainer = range.endContainer;
  const preHighlightData = getPreHighlightData(range);
  console.log("preHighlightData: ", preHighlightData);
  const startPage = getParentPage(startContainer);
  const endPage = getParentPage(endContainer);
  // if (startPage === endPage) {
  if (Object.keys(masterHighlights).length > 0) {
    if (!preHighlightData.startSpanId && !preHighlightData.endSpanId) {
      const startContainer = preHighlightData.startContainer;
      const endContainer = preHighlightData.endContainer;

      const startParentSpan = getParentSpan(startContainer);
      const endParentSpan = getParentSpan(endContainer);

      // Retrieve the group IDs from the parent spans
      const startGroupId = startParentSpan.getAttribute(
        "data-highlight-group-id"
      );
      const endGroupId = endParentSpan.getAttribute("data-highlight-group-id");
      if (startGroupId === endGroupId) {
        console.log("Highlight overlay");
        selection.removeAllRanges();
        return;
      }

      console.log("Double partial detected!");
      let overlappedHighlights = overlapLeftAndRightCheck(preHighlightData);
      console.log(
        "overlappedHighlights double partial: ",
        overlappedHighlights
      );
      if (overlappedHighlights.length > 0) {
        // Call the function to undo the highlights for each overlapped highlight
        undoHighlights(overlappedHighlights);
        const newRange = createNewRangeDoubleOverlap(
          preHighlightData,
          overlappedHighlights
        );
        console.log("newRange: ", newRange);
        let newStartContainer = newRange.startContainer;
        let newEndContainer = newRange.endContainer;
        if (newStartContainer === newEndContainer) {
          // Single span selection
          highlightSingleSpan(newRange, null);
        } else {
          // Multiple span selection
          highlightMultipleSpans(newRange, null);
        }
        selection.removeAllRanges();
        return { masterHighlights, pageHighlights };
      }
    }
    // Overlap check for missing endSpanId indicating a potential left overlap
    else if (!preHighlightData.endSpanId) {
      console.log("Left overlap detected!");
      let overlappedHighlights = overlapLeftCheck(preHighlightData);
      console.log("overlappedHighlights left: ", overlappedHighlights);
      if (overlappedHighlights.length > 0) {
        // Call the function to undo the highlights for each overlapped highlight
        undoHighlights(overlappedHighlights);
        const newRange = createNewRangeLeftOverlap(
          preHighlightData,
          overlappedHighlights
        );
        console.log("newRange: ", newRange);
        let newStartContainer = newRange.startContainer;
        let newEndContainer = newRange.endContainer;
        if (newStartContainer === newEndContainer) {
          // Single span selection
          highlightSingleSpan(newRange, null);
        } else {
          // Multiple span selection
          highlightMultipleSpans(newRange, null);
        }
        selection.removeAllRanges();
        return { masterHighlights, pageHighlights };
      }
    }
    // Overlap check for missing startSpanId indicating a potential right overlap
    else if (!preHighlightData.startSpanId) {
      console.log("Right overlap detected!");
      let overlappedHighlights = overlapRightCheck(preHighlightData);
      if (overlappedHighlights.length > 0) {
        // Call the function to undo the highlights for each overlapped highlight
        undoHighlights(overlappedHighlights);
        const newRange = createNewRangeRightOverlap(
          preHighlightData,
          overlappedHighlights
        );
        console.log("newRange: ", newRange);
        let newStartContainer = newRange.startContainer;
        let newEndContainer = newRange.endContainer;
        // deleteHighlightsData();
        if (newStartContainer === newEndContainer) {
          // Single span selection
          highlightSingleSpan(newRange, null);
        } else {
          // Multiple span selection
          highlightMultipleSpans(newRange, null);
        }
        selection.removeAllRanges();
        return { masterHighlights, pageHighlights };
      }
      // return;
    } else {
      let overlappedHighlights = overlapCheck(preHighlightData);
      if (overlappedHighlights.length > 0) {
        console.log("overlap full detected");
        undoHighlights(overlappedHighlights);
        if (startContainer === endContainer) {
          // Single span selection
          highlightSingleSpan(range, null);
        } else {
          // Multiple span selection
          highlightMultipleSpans(range, null);
        }
        selection.removeAllRanges();
        return { masterHighlights, pageHighlights };
      }
    }

    console.log("preHighlightData: ", preHighlightData);

    // Check for existing highlights on the page before proceeding with overlap checks
  }
  //Highlight
  if (startContainer === endContainer) {
    // Single span selection
    highlightSingleSpan(range, null);
  } else {
    // Multiple span selection
    highlightMultipleSpans(range, null);

    // console.log("Range Start Offset: ", range.startOffset);
    // console.log("Range Start Container: ", range.startContainer);
    // console.log("Range End Offset: ", range.endOffset);
    // console.log("Range End Container: ", range.endContainer);
    // console.log("Range Collapsed: ", range.collapsed);
    // console.log("Range String: ", range.toString());
    // selectionReAdjust(selection, range);
    // const treeWalker = document.createTreeWalker(
    //   document.body,
    //   NodeFilter.SHOW_ELEMENT,
    //   {
    //     acceptNode: node =>
    //       node.nodeName === "SPAN"
    //         ? NodeFilter.FILTER_ACCEPT
    //         : NodeFilter.FILTER_SKIP,
    //   },
    //   false
    // );

    // let lastHighlightedSpan = null;
    // treeWalker.currentNode = startContainer;

    // while (treeWalker.nextNode()) {
    //   let current = treeWalker.currentNode;
    //   // console.log("current: ", current);

    //   // Check if the current node is a highlighted span.
    //   if (current.classList.contains("highlighted")) {
    //     lastHighlightedSpan = current; // Update lastHighlightedSpan because current is highlighted
    //   } else {
    //     // If the current node is not highlighted and does not have a highlighted child, break the loop.
    //     if (!current.querySelector(".highlighted")) {
    //       break;
    //     }
    //   }
    // }

    // // If we found a last highlighted span, adjust the selection range
    // if (lastHighlightedSpan) {
    //   let range = document.createRange();

    //   if (startContainer.nodeType === Node.TEXT_NODE) {
    //     let correctStartContainer = startContainer.nextSibling.firstChild;
    //     range.setStart(correctStartContainer, 0);
    //   } else {
    //     range.setStart(startContainer, 0); // Keep the original start
    //   }

    //   let textNode = lastHighlightedSpan.firstChild; // Assuming the text node is the first child
    //   console.log(
    //     "lastHighlightedSpan.firstChild: ",
    //     lastHighlightedSpan.firstChild
    //   );

    //   // Now we use the text node and the length of its text content to set the end of the range
    //   range.setEnd(textNode, textNode.textContent.length);
    //   // Clear and reapply the selection
    //   selection.removeAllRanges();
    //   selection.addRange(range);
    // }
  }
  selection.removeAllRanges();
  return { masterHighlights, pageHighlights };
}

function createNewRangeLeftOverlap(preHighlightData, overlappedHighlights) {
  let range = document.createRange();

  let startNode = preHighlightData.startContainer;
  // console.log("startNode:", startNode);

  let startOffset = preHighlightData.startOffset;
  // console.log("startOffset:", startOffset);

  let endHighlightData = overlappedHighlights.at(-1);
  // console.log("endHighlightData:", endHighlightData);

  let endOffset;
  let endNode = document.getElementById(endHighlightData.endSpanId).firstChild;
  // console.log("endNode:", endNode);
  let endNodeLastChild = document.getElementById(
    endHighlightData.endSpanId
  ).lastChild;
  // console.log("endNode:", endNodeLastChild);
  if (startNode === endNode) {
    endOffset =
      endHighlightData.absoluteStartOffset +
      endHighlightData.highlightedTextLength;
  } else {
    endOffset = endHighlightData.endOffset;
  }
  // console.log("endcontainer: ", preHighlightData.endContainer);
  // console.log(
  //   "endcontainer text content: ",
  //   preHighlightData.endContainer.textContent
  // );
  // console.log(
  //   "endcontainer text content length: ",
  //   preHighlightData.endContainer.textContent.length
  // );

  // endHighlightData.endOffset;
  // console.log("endOffset:", endOffset);

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
  // Now, apply the highlight. Use the appropriate function based on your implementation.
  // This might be highlightSingleSpan or highlightMultipleSpans depending on the range.
}
function getStartNode(startSpan, absoluteStartOffset) {
  let current = startSpan.firstChild; // Start with the first child of the span
  let accumulatedLength = 0;

  while (current !== null) {
    if (
      current.nodeType === Node.TEXT_NODE ||
      (current.nodeType === Node.ELEMENT_NODE &&
        current.classList.contains("highlighted"))
    ) {
      let textLength = current.textContent.length;
      if (accumulatedLength + textLength >= absoluteStartOffset) {
        return current;
      }
      accumulatedLength += textLength;
    }
    current = current.nextSibling; // Move to the next sibling
  }

  return startSpan.firstChild;
}
function getEndNode(endSpan, absoluteEndOffset) {
  let current = endSpan.firstChild; // Start with the first child of the span
  let accumulatedLength = 0;

  while (current !== null) {
    if (
      current.nodeType === Node.TEXT_NODE ||
      (current.nodeType === Node.ELEMENT_NODE &&
        current.classList.contains("highlighted"))
    ) {
      let textLength = current.textContent.length;
      if (accumulatedLength + textLength >= absoluteEndOffset) {
        return current;
      }
      accumulatedLength += textLength;
    }
    current = current.nextSibling; // Move to the next sibling
  }

  return endSpan.firstChild;
}
function createNewRangeDoubleOverlap(preHighlightData, overlappedHighlights) {
  let range = document.createRange();
  let startHighlight = overlappedHighlights.at(0);
  let endHighlight = overlappedHighlights.at(-1);

  let startSpan = document.getElementById(startHighlight.startSpanId);
  let startNode = getStartNode(startSpan, startHighlight.absoluteStartOffset);
  // let startNodeLastChild = document.getElementById(
  //   startHighlight.startSpanId
  // ).lastChild;
  // console.log("startSpan:", startSpan);

  // console.log("startNode:", startNode);
  // console.log("startNodeLastChild:", startNodeLastChild);

  let startOffset = startHighlight.startOffset;
  // console.log("startOffset:", startOffset);

  // console.log("endHighlightData:", endHighlight);

  let endSpan = document.getElementById(endHighlight.endSpanId);
  let endNode = getEndNode(endSpan, endHighlight.absoluteEndOffset);
  // if (startHighlight.startSpanId == endHighlight.endSpanId) {
  //   endNode = startNode;
  // } else {
  //   endNode = document.getElementById(endHighlight.endSpanId).firstChild;
  // }
  // let endNodeLastChild = document.getElementById(
  //   endHighlight.startSpanId
  // ).lastChild;
  // console.log("endSpan:", endSpan);
  // console.log("endNode:", endNode);
  // console.log("endNodeLastChild:", endNodeLastChild);

  let startNodeStartOffset;
  // let endNodeEndOffset;
  if (startHighlight.startSpanId == startHighlight.endSpanId) {
    // startNodeStartOffset = startHighlight.startOffset;
    startNodeStartOffset = startHighlight.startOffset;
    // console.log("startNodeStartOffset same span :", startNodeStartOffset);
  } else {
    startNodeStartOffset = 0;
    // console.log("startNodeStartOffset different span:", startNodeStartOffset);
  }
  // if (endHighlight.startSpanNum != endHighlight.endSpanId){
  //   endNodeEndOffset = endHighlight.startOffset;
  // } else {
  //   startNodeOffset = 0;
  // }
  let endOffset;

  if (startHighlight.endSpanId === endHighlight.endSpanId) {
    endOffset =
      startNodeStartOffset +
      preHighlightData.startOffset +
      preHighlightData.highlightedTextLength +
      endHighlight.highlightedTextLength -
      preHighlightData.endOffset;
    // console.log("endoffset same span :", endOffset);
  } else {
    endOffset = endHighlight.absoluteEndOffset;
    // console.log("endoffset multi span :", endOffset);
  }

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
  // Now, apply the highlight. Use the appropriate function based on your implementation.
  // This might be highlightSingleSpan or highlightMultipleSpans depending on the range.
}
function createNewRangeRightOverlap(preHighlightData, overlappedHighlights) {
  let range = document.createRange();
  console.log("preHighlightData:", preHighlightData);
  //Overlap right has reverse overlappedHighlights order as we start from right and acquire highlights to left
  let startHighlightData = overlappedHighlights.at(-1);
  // console.log("startHighlightData:", startHighlightData);

  let startNode = document.getElementById(
    startHighlightData.startSpanId
  ).firstChild;

  // console.log("startNode first child:", startNode);
  let startNodeLastChild = document.getElementById(
    startHighlightData.startSpanId
  ).lastChild;
  // console.log("startNode last child:", startNodeLastChild);
  // console.log("startNode id:", startHighlightData.startSpanId);

  let startOffset = startHighlightData.startOffset;
  // console.log("startOffset:", startOffset);

  let endContainerNode = preHighlightData.endContainer;
  let endNodeFirstChild = document.getElementById(
    preHighlightData.endSpanId
  ).firstChild;
  let endNodeLastChild = document.getElementById(
    preHighlightData.endSpanId
  ).lastChild;
  let endNode = document.getElementById(preHighlightData.endSpanId);
  // console.log("endcontainer: ", preHighlightData.endContainer);
  // console.log(
  //   "endcontainer text content: ",
  //   preHighlightData.endContainer.textContent
  // );
  // console.log(
  //   "endcontainer text content length: ",
  //   preHighlightData.endContainer.textContent.length
  // );
  // console.log("endNode with span id:", endNode);
  // console.log("endNodeFirstChild:", endNodeFirstChild);
  // console.log("endNodeFirstChild:", endNodeLastChild);
  let endOffset;

  if (startHighlightData.startSpanId === preHighlightData.endSpanId) {
    endOffset =
      startHighlightData.startOffset +
      preHighlightData.highlightedTextLength +
      preHighlightData.startOffset;
    // console.log("endOffset 1:", endOffset);
  } else {
    endOffset = preHighlightData.absoluteEndOffset;
    // let endNodeHighlight = endNode.querySelector("span.highlighted");
    // console.log("endNodeHighlight: ", endNodeHighlight);
    // if (endNodeHighlight) {
    //   let highlightLength = endNodeHighlight.textContent.length;
    //   endOffset = highlightLength + preHighlightData.endOffset;
    // }
  }
  // console.log("endOffset 2:", endOffset);

  range.setStart(startNodeLastChild, startOffset);
  // console.log("Range Start Offset: ", range.startOffset);
  // console.log("Range Start Container: ", range.startContainer);
  // console.log("Range End Offset: ", range.endOffset);
  // console.log("Range End Container: ", range.endContainer);
  // console.log("Range Collapsed: ", range.collapsed);
  // console.log("Range String: ", range.toString());
  range.setEnd(endNodeFirstChild, endOffset);
  // console.log("Range Start Offset: ", range.startOffset);
  // console.log("Range Start Container: ", range.startContainer);
  // console.log("Range End Offset: ", range.endOffset);
  // console.log("Range End Container: ", range.endContainer);
  // console.log("Range Collapsed: ", range.collapsed);
  // console.log("Range String: ", range.toString());
  return range;
}

function highlightSingleSpan(range, renderHighlightGroupId) {
  let groupId;
  if (!renderHighlightGroupId) {
    groupId = uuidv4();
  } else {
    groupId = renderHighlightGroupId;
  }

  let highlightData = getHighlightData(range, groupId, null, color);

  const selectedText = range.toString();
  const highlightedSpan = document.createElement("span");
  highlightedSpan.textContent = selectedText;
  highlightedSpan.classList.add("highlighted");
  highlightedSpan.style.backgroundColor = color;
  highlightedSpan.style.color = "black"; // Ensure the text color remains readable

  highlightedSpan.setAttribute("data-highlight-group-id", groupId);

  range.deleteContents();
  range.insertNode(highlightedSpan);

  const absoluteStartOffset = calculateAbsoluteStartOffset(highlightedSpan);
  highlightData.absoluteStartOffset = absoluteStartOffset;
  addHighlightToPage(highlightData.pageNumber, highlightData);
  masterHighlights[groupId] = highlightData;
  console.log("Single Span Highlight");
  console.log("pageHighlights: ", pageHighlights);
  console.log("masterHighlights: ", masterHighlights);
  adjustHighlightOffset(highlightedSpan);
}

function highlightMultipleSpans(range, renderHighlightGroupId) {
  const startSpan = getParentSpan(range.startContainer);
  const endSpan = getParentSpan(range.endContainer);
  const startPage = getParentPage(startSpan);
  const endPage = getParentPage(endSpan);
  // const selectedText = startSpan.textContent.slice(range.startOffset);
  // const absoluteStartOffsetMain = calculateAbsoluteStartOffset(startSpan);
  // startSpan.parentNode.normalize();

  if (startPage === endPage) {
    // Highlighting within the same page
    let groupId;
    if (!renderHighlightGroupId) {
      groupId = uuidv4();
    } else {
      groupId = renderHighlightGroupId;
    }

    const highlightData = getHighlightData(range, groupId, null, color);

    const selectedSpans = getSelectedSpans(startSpan, endSpan);
    highlightSpans(selectedSpans, range, groupId, highlightData);
    masterHighlights[groupId] = highlightData;
    console.log(
      "multispan highlight same page masterHighlights: ",
      masterHighlights
    );
    let endContainer = range.endContainer;
    console.log("range.endContainer:", range.endContainer); // Should print 3 for Text node
    console.log(endContainer.nodeType); // Should print 3 for Text node

    // console.log("endContainer: ", endContainer);
    let lastHighlightedSpanNode = endContainer.querySelector(
      `span[data-highlight-group-id="${groupId}"]`
    );
    // console.log("lastHighlightedSpan: ", lastHighlightedSpanNode);

    adjustHighlightOffset(lastHighlightedSpanNode);
  } else {
    // Highlighting across multiple pages
    let groupId;
    if (!renderHighlightGroupId) {
      groupId = uuidv4();
    } else {
      groupId = renderHighlightGroupId;
    }
    const highlightData = getHighlightData(range, groupId, null, color);
    const highlightDataMaster = getHighlightData(range, groupId, null, color);
    const startPageSpans = getSpansInPage(startPage);
    const endPageSpans = getSpansInPage(endPage);

    // Highlight spans in the start page
    const startPageSelectedSpans = getSelectedSpans(
      startSpan,
      startPageSpans[startPageSpans.length - 1]
    );
    const firstPageLastSpan = startPageSelectedSpans.at(-1);
    highlightData.endSpanId = firstPageLastSpan.id;
    // highlightData.startSpanNum = getNumericSpanId(startSpan.id);
    highlightData.endSpanNum = getNumericSpanId(firstPageLastSpan.id);
    highlightData.endOffset = firstPageLastSpan.textContent.length;
    highlightData.absoluteEndOffset = firstPageLastSpan.textContent.length;

    highlightSpans(startPageSelectedSpans, range, groupId, highlightData);
    highlightDataMaster.absoluteStartOffset = highlightData.absoluteStartOffset;
    masterHighlights[groupId] = highlightDataMaster;
    console.log(
      "multispan multipage highlight masterHighlights: ",
      masterHighlights
    );
    // Highlight spans in the pages between start and end
    let currentPage = getNextPage(startPage);

    while (currentPage && currentPage !== endPage) {
      // const groupId = uuidv4();
      const highlightData = getHighlightData(range, groupId, 0, color);

      const pageSpans = getSpansInPage(currentPage);
      const pageNumber = parseInt(currentPage.getAttribute("data-page-number"));
      const firstSpanId = pageSpans.at(0).id;
      const lastSpanId = pageSpans.at(-1).id;

      highlightData.startOffset = 0;
      highlightData.endOffset = pageSpans.at(-1).textContent.length;
      highlightData.absoluteEndOffset = pageSpans.at(-1).textContent.length;

      highlightData.startSpanId = firstSpanId;
      highlightData.endSpanId = lastSpanId;
      highlightData.pageNumber = pageNumber;
      highlightData.startSpanNum = getNumericSpanId(firstSpanId);
      highlightData.endSpanNum = getNumericSpanId(lastSpanId);

      highlightSpans(pageSpans, range, groupId, highlightData);
      currentPage = getNextPage(currentPage);
    }

    // Highlight spans in the end page
    const endPageSelectedSpans = getSelectedSpans(endPageSpans[0], endSpan);
    const firstSpanId = endPageSelectedSpans.at(0).id;
    const pageNumber = parseInt(currentPage.getAttribute("data-page-number"));

    // const groupIdEndPage = uuidv4();
    const highlightDataEndPage = getHighlightData(range, groupId, 0, color);
    highlightDataEndPage.startOffset = 0;
    highlightDataEndPage.startSpanId = firstSpanId;
    highlightDataEndPage.pageNumber = pageNumber;
    highlightDataEndPage.startSpanNum = getNumericSpanId(firstSpanId);

    highlightSpans(endPageSelectedSpans, range, groupId, highlightDataEndPage);

    let endContainer = range.endContainer;
    // console.log("multipage endContainer: ", endContainer);
    let lastHighlightedSpanNode = endContainer.querySelector(
      `span[data-highlight-group-id="${groupId}"]`
    );
    // console.log("multipage lastHighlightedSpan: ", lastHighlightedSpanNode);

    adjustHighlightOffset(lastHighlightedSpanNode);
  }
}

function adjustHighlightOffset(highlightedSpan) {
  let current = highlightedSpan;
  // console.log("current Node: ", current);
  let accumulatedTextLength = 0;
  while (current.nextSibling) {
    current = current.nextSibling;
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.classList.contains("highlighted")
    ) {
      let highlightGroupId = current.getAttribute("data-highlight-group-id");
      //Adjust highlight data
      masterHighlights[highlightGroupId].startOffset = accumulatedTextLength;
      if (
        masterHighlights[highlightGroupId].startSpanId ===
        masterHighlights[highlightGroupId].endSpanId
      ) {
        masterHighlights[highlightGroupId].endOffset =
          masterHighlights[highlightGroupId].startOffset +
          masterHighlights[highlightGroupId].highlightedTextLength;
      }

      // console.log("highlightGroupId: ", highlightGroupId);
      console.log(
        "adjusted highlight data: ",
        masterHighlights[highlightGroupId]
      );
      return;
    }
    accumulatedTextLength += current.textContent.length;
  }
  return;
}
function getParentPage(span) {
  if (!span) {
    return null;
  }
  while (span.parentNode) {
    if (span.parentNode && span.parentNode.hasAttribute("data-page-number")) {
      return span.parentNode;
    }
    span = span.parentNode;
  }
  return null;
}

function getNextPage(page) {
  let nextPage = page.nextElementSibling;
  while (nextPage && !nextPage.hasAttribute("data-page-number")) {
    nextPage = nextPage.nextElementSibling;
  }
  return nextPage;
}

function getSpansInPage(page) {
  return Array.from(page.getElementsByTagName("span"));
}

function highlightSpans(spans, range, groupId, highlightData) {
  spans.forEach((span, index) => {
    const isFirstSpan = index === 0; // Calculate absolute offset if isFirstSpan is true.
    if (span === range.startContainer.parentNode) {
      //Partial selection at the start
      const startOffset = range.startOffset;
      const selectedText = range.startContainer.textContent.slice(startOffset);
      wrapSelectedText(
        range.startContainer,
        selectedText,
        startOffset,
        groupId,
        isFirstSpan,
        highlightData
      );
      if (selectedText.parentNode) {
        selectedText.parentNode.normalize();
      }
    } else if (span === range.endContainer.parentNode) {
      // Partial selection at the end
      const endOffset = range.endOffset;
      const selectedText = range.endContainer.textContent.slice(0, endOffset);
      wrapSelectedText(
        range.endContainer,
        selectedText,
        0,
        groupId,
        isFirstSpan,
        highlightData
      );
      if (selectedText.parentNode) {
        selectedText.parentNode.normalize();
      }
    } else {
      // In between span/s
      const highlightedSpan = document.createElement("span");
      highlightedSpan.textContent = span.textContent;
      highlightedSpan.classList.add("highlighted");
      highlightedSpan.style.backgroundColor = color;
      highlightedSpan.style.color = "black"; // Ensure the text color remains readable

      highlightedSpan.setAttribute("data-highlight-group-id", groupId);
      span.textContent = "";
      span.appendChild(highlightedSpan);
    }
  });

  addHighlightToPage(highlightData.pageNumber, highlightData);
  console.log(pageHighlights);
}

function getParentSpan(node) {
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === "SPAN") {
      return node;
    }
    node = node.parentNode;
  }
  return null;
}

function getSelectedSpans(startSpan, endSpan) {
  const selectedSpans = [];
  let currentSpan = startSpan;

  while (currentSpan) {
    selectedSpans.push(currentSpan);
    if (currentSpan === endSpan) {
      break;
    }
    currentSpan = currentSpan.nextElementSibling;
  }

  return selectedSpans;
}

function wrapSelectedText(
  container,
  selectedText,
  startOffset,
  groupId,
  isFirstSpan,
  highlightData
) {
  const textNode = container.splitText(startOffset);
  const remainingText = textNode.splitText(selectedText.length);
  const highlightedSpan = document.createElement("span");
  highlightedSpan.textContent = selectedText;
  highlightedSpan.classList.add("highlighted");
  highlightedSpan.style.backgroundColor = color;
  highlightedSpan.style.color = "black"; // Ensure the text color remains readable

  highlightedSpan.setAttribute("data-highlight-group-id", groupId);
  textNode.parentNode.replaceChild(highlightedSpan, textNode);
  highlightedSpan.parentNode.insertBefore(
    remainingText,
    highlightedSpan.nextSibling
  );
  if (isFirstSpan) {
    const absoluteStartOffset = calculateAbsoluteStartOffset(
      highlightedSpan,
      startOffset
    );
    highlightData.absoluteStartOffset = absoluteStartOffset;
  }
  if (remainingText.parentNode) {
    remainingText.parentNode.normalize();
  }
  if (textNode.parentNode) {
    textNode.parentNode.normalize();
  }
}

function calculateAbsoluteStartOffset(startNode) {
  let absoluteStartOffset = 0;

  // Traverse through previous siblings to calculate the total length of text before the startNode
  let currentNode = startNode;
  while (currentNode.previousSibling) {
    currentNode = currentNode.previousSibling;
    absoluteStartOffset += currentNode.textContent.length;
  }

  return absoluteStartOffset;
}
function addHighlightToPage(pageNumber, highlightData) {
  if (!pageHighlights[pageNumber]) {
    pageHighlights[pageNumber] = [];
  }
  pageHighlights[pageNumber].push(highlightData);
}

function getNumericSpanId(spanId) {
  // Assuming the span ID format is always "page-counter"
  return parseInt(spanId.split("-")[1], 10);
}

function getHighlightData(range, groupId, absoluteStartOffset, color) {
  const startSpan = getParentSpan(range.startContainer);
  const endSpan = getParentSpan(range.endContainer);
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;
  const startPage = getParentPage(startSpan);
  const endPage = getParentPage(endSpan);
  const startSpanId = startSpan.id;
  const endSpanId = endSpan.id;
  const startPageNumber = parseInt(startPage.getAttribute("data-page-number"));
  const pageNumber = startPageNumber;
  const endPageNumber = parseInt(endPage.getAttribute("data-page-number"));

  const absoluteEndOffset = calculateAbsoluteEndOffset(
    range.endContainer,
    range.endOffset
  );

  // const highlightedText = range.toString();
  const highlightedTextLength = range.toString().length;
  const currentTimestamp = new Date().toISOString();
  const highlightData = {
    groupId,
    absoluteStartOffset,
    absoluteEndOffset,
    startSpanId,
    endSpanId,
    startOffset,
    endOffset,
    startSpanNum: getNumericSpanId(startSpanId),
    endSpanNum: getNumericSpanId(endSpanId),
    // highlightedText,
    highlightedTextLength,
    startPageNumber,
    pageNumber,
    endPageNumber,
    color: color, // Default color or user-selected color
    notes: "", // Notes entered by the user
    createdAt: currentTimestamp, // Timestamp when the highlight was created
    lastModifiedAt: currentTimestamp, // Initially the same as createdAt
  };

  return highlightData;
}

function getPreHighlightData(range) {
  const startSpan = getParentSpan(range.startContainer);
  const endSpan = getParentSpan(range.endContainer);
  const startOffset = range.startOffset;
  const endOffset = range.endOffset;
  const startSpanId = startSpan.id;
  const endSpanId = endSpan.id;
  const startPage = getParentPage(startSpan);
  const endPage = getParentPage(endSpan);

  const startPageNumber = parseInt(startPage.getAttribute("data-page-number"));
  const endPageNumber = parseInt(endPage.getAttribute("data-page-number"));
  const absoluteEndOffset = calculateAbsoluteEndOffset(
    range.endContainer,
    range.endOffset
  );
  const highlightData = {
    startOffset,
    endOffset,
    absoluteEndOffset,
    highlightedTextLength: range.toString().length,
    startContainer: range.startContainer,
    endContainer: range.endContainer,
    startSpanId,
    endSpanId,
    startSpanNum: getNumericSpanId(startSpanId),
    endSpanNum: getNumericSpanId(endSpanId),
    highlightedText: range.toString(),
    startPageNumber,
    endPageNumber,
  };

  return highlightData;
}
function getTextNodeFromContainer(container) {
  let node = container;
  // Loop until you find a text node or there are no more child nodes
  while (node && node.nodeType !== Node.TEXT_NODE) {
    if (node.firstChild) {
      node = node.firstChild;
    } else {
      // If there is no firstChild, try to get the next sibling or parent's next sibling
      while (node && !node.nextSibling) {
        node = node.parentNode;
      }
      node = node ? node.nextSibling : null;
    }
  }
  return node; // This will be a text node, or null if none found
}

function calculateAbsoluteEndOffset(endContainer, endOffset) {
  // Split the endContainer at the endOffset to create a new text node
  // console.log("endContainer: ", endContainer);
  let textNode = getTextNodeFromContainer(endContainer);
  const endOffNode = textNode.splitText(endOffset);

  // Insert a temporary zero-width space element to mark the end of the highlight
  const tempMarker = document.createElement("span");
  tempMarker.style.display = "inline-block"; // Ensure it's in the flow of text
  tempMarker.style.width = "0px"; // Zero width
  tempMarker.textContent = "\u200B"; // Zero-width space

  // Insert the marker before the new text node created by splitText
  textNode.parentNode.insertBefore(tempMarker, endOffNode);

  // Now calculate the absolute offset
  let absoluteStartOffset = 0;
  let currentNode = tempMarker;

  // Walk back through the siblings, accumulating their text lengths
  while (currentNode.previousSibling) {
    currentNode = currentNode.previousSibling;
    absoluteStartOffset += currentNode.textContent.length;
  }

  // Cleanup: remove the temporary marker and normalize to merge text nodes back
  tempMarker.parentNode.removeChild(tempMarker);
  textNode.parentNode.normalize();

  return absoluteStartOffset;
}

function customFilter(node) {
  // Accept only text nodes and <span> elements
  if (node.nodeType === Node.TEXT_NODE) {
    return NodeFilter.FILTER_ACCEPT;
  }
  if (
    node.nodeType === Node.ELEMENT_NODE &&
    node.tagName.toLowerCase() === "span"
  ) {
    return NodeFilter.FILTER_ACCEPT;
  }
  return NodeFilter.FILTER_SKIP;
}
function overlapLeftHighlightCheck(preHighlightData, overlapHighlightsMaster) {
  const startContainer = preHighlightData.startContainer;
  // console.log("startContainer: ", startContainer);

  let startContainerTextNode = getTextNodeFromContainer(startContainer);
  const startOffNode = startContainerTextNode.splitText(
    preHighlightData.startOffset
  );
  // const startOffNode = startContainer.splitText(preHighlightData.startOffset);
  // console.log("startContainerTextNode: ", startContainerTextNode);
  // console.log("startOffNode: ", startOffNode);
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ALL,
    { acceptNode: customFilter },
    false
  );
  treeWalker.currentNode = startOffNode;
  const highlightedTextLength = preHighlightData.highlightedTextLength;
  let accumulatedTextLength = 0;
  let inHighlightGroupId;
  // console.log("highlightedTextLength: ", highlightedTextLength);

  while (accumulatedTextLength < highlightedTextLength) {
    let current = treeWalker.currentNode;
    // console.log("current: ", current);
    // console.log("current's text content: ", current.textContent);
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.tagName.toLowerCase() === "span" &&
      current.id
    ) {
      treeWalker.nextNode();
      continue;
    }
    // When hitting a new span, check for overlaps based on existing highlight data
    else if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.classList.contains("highlighted") &&
      accumulatedTextLength + current.textContent.length < highlightedTextLength
    ) {
      let currentGroupId = current.getAttribute("data-highlight-group-id");
      if (inHighlightGroupId != currentGroupId) {
        inHighlightGroupId = currentGroupId;
        let overlap = masterHighlights[currentGroupId];
        overlapHighlightsMaster.push(overlap);
      }
      treeWalker.nextNode();
      continue;
    } else {
      accumulatedTextLength += current.textContent.length;
    }
    // console.log("current.textContent.length: ", current.textContent.length);
    // console.log("accumulatedTextLength: ", accumulatedTextLength);

    treeWalker.nextNode();
  }

  console.log("treeWalker.currentNode: ", treeWalker.currentNode);
  const endHighlight = getParentSpan(treeWalker.currentNode);
  let currentGroupId = endHighlight.getAttribute("data-highlight-group-id");

  let overlap = masterHighlights[currentGroupId];
  overlapHighlightsMaster.push(overlap);
  if (startOffNode.parentNode) {
    startOffNode.parentNode.normalize();
  }

  return;
}
function overlapRightHighlightCheck(preHighlightData, overlapHighlightsMaster) {
  const endContainer = preHighlightData.endContainer;
  // console.log("1 endContainer: ", endContainer);
  // console.log("preHighlightData: ", preHighlightData);
  // console.log("preHighlightData.endOffset: ", preHighlightData.endOffset);

  // console.log("1 endContainer textcontent: ", endContainer.textContent);
  let endContainerTextNode = getTextNodeFromContainer(endContainer);
  const endOffNode = endContainerTextNode.splitText(preHighlightData.endOffset);
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ALL,
    { acceptNode: customFilter },
    false
  );
  // console.log("2 endContainer: ", endContainer);
  // console.log("2 endContainer textcontent: ", endContainer.textContent);

  treeWalker.currentNode = endContainer;
  // console.log("treeWalker.currentNode = endContainer: ", endContainer);

  // console.log("endoffnode: ", endOffNode);
  const highlightedTextLength = preHighlightData.highlightedTextLength;
  let accumulatedTextLength = preHighlightData.endOffset;
  // endContainer.textContent.length - endOffNode.textContent.length;
  // console.log("highlightedTextLength: ", highlightedTextLength);
  // console.log("accumulatedTextLength: ", accumulatedTextLength);
  let inHighlightGroupId;
  // console.log("highlightedTextLength: ", highlightedTextLength);

  //Walk from right to left to the overlap right highlight
  treeWalker.previousNode();
  while (accumulatedTextLength < highlightedTextLength) {
    let current = treeWalker.currentNode;
    // console.log("currentNode: ", current);

    // console.log("current: ", current);
    // Check if the node is a <span> with an ID or a <br> element, if so, skip it.
    if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.tagName.toLowerCase() === "span" &&
      current.id
    ) {
      // Move to the next node without counting the text length
      treeWalker.previousNode();
      continue;
    }

    // When hitting a new span, check for overlaps based on existing highlight data
    else if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.classList.contains("highlighted")
      // accumulatedTextLength + current.textContent.length < highlightedTextLength
    ) {
      let currentGroupId = current.getAttribute("data-highlight-group-id");
      if (inHighlightGroupId != currentGroupId) {
        inHighlightGroupId = currentGroupId;
        let overlap = masterHighlights[currentGroupId];
        overlapHighlightsMaster.push(overlap);
        console.log("pushed overlap to master: ", overlap);
        // let overlaps = pageHighlights[
        //   preHighlightData.startPageNumber
        // ].filter(hl => hl.groupId === currentGroupId);
        // overlaps.forEach(overlap => {
        //   overlappedHighlights.push(overlap);
        // });
      }
      treeWalker.previousNode();
      continue;
    } else {
      accumulatedTextLength += current.textContent.length;
    }
    // console.log("current.textContent.length: ", current.textContent.length);
    // console.log("accumulatedTextLength: ", accumulatedTextLength);
    treeWalker.previousNode();
  }
  // console.log(
  //   "final current.textContent.length: ",
  //   treeWalker.currentNode.textContent.length
  // );
  // console.log("final accumulatedTextLength: ", accumulatedTextLength);
  // console.log("final treeWalker.currentNode: ", treeWalker.currentNode);
  const endHighlight = getParentSpan(treeWalker.currentNode);
  let currentGroupId = endHighlight.getAttribute("data-highlight-group-id");
  // let overlaps = pageHighlights[preHighlightData.startPageNumber].filter(
  //   hl => hl.groupId === currentGroupId
  // );
  // overlaps.forEach(overlap => {
  //   overlappedHighlights.push(overlap);
  // });
  let overlap = masterHighlights[currentGroupId];
  overlapHighlightsMaster.push(overlap);
  if (endOffNode.parentNode) {
    endOffNode.parentNode.normalize();
  }
  return;
}
function overlapLeftCheck(preHighlightData) {
  let overlapHighlightsMaster = [];

  // overlapCheckStartSpan(preHighlightData, startOffNode, overlappedHighlights);

  overlapLeftHighlightCheck(preHighlightData, overlapHighlightsMaster);
  return overlapHighlightsMaster;
}

function overlapRightCheck(preHighlightData) {
  let overlapHighlightsMaster = [];

  // overlapCheckStartSpan(preHighlightData, startOffNode, overlappedHighlights);

  overlapRightHighlightCheck(preHighlightData, overlapHighlightsMaster);
  console.log("All overlappedHighlights right: ", overlapHighlightsMaster);
  return overlapHighlightsMaster;
}

function overlapLeftAndRightCheck(preHighlightData) {
  // Get parent spans for start and end containers
  const startContainer = preHighlightData.startContainer;
  const endContainer = preHighlightData.endContainer;

  const startParentSpan = getParentSpan(startContainer);
  const endParentSpan = getParentSpan(endContainer);

  // Retrieve the group IDs from the parent spans
  const startGroupId = startParentSpan.getAttribute("data-highlight-group-id");
  const endGroupId = endParentSpan.getAttribute("data-highlight-group-id");
  const pageNumber = preHighlightData.startPageNumber;
  const startPage = preHighlightData.startPageNumber;
  const endPage = preHighlightData.endPageNumber;

  // Retrieve highlight data for the start and end based on group IDs
  // const startHighlightData = pageHighlights[pageNumber].find(
  //   hl => hl.groupId === startGroupId
  // );

  // const endHighlightData = pageHighlights[pageNumber].find(
  //   hl => hl.groupId === endGroupId
  // );
  const startHighlightData = masterHighlights[startGroupId];
  const endHighlightData = masterHighlights[endGroupId];

  // console.log("startHighlightData: ", startHighlightData);
  // console.log("endHighlightData: ", endHighlightData);
  // console.log("startParentSpan: ", startParentSpan);
  // console.log("endParentSpan: ", endParentSpan);

  if (startHighlightData.endSpanId === endHighlightData.startSpanId) {
    let inBetweenOverlaps = Object.values(masterHighlights).filter(
      hl =>
        hl.startSpanId === startHighlightData.startSpanId &&
        hl.absoluteStartOffset > startHighlightData.absoluteStartOffset &&
        hl.absoluteStartOffset < endHighlightData.absoluteStartOffset
    );
    let overlappedHighlights = [
      startHighlightData,
      ...inBetweenOverlaps,
      endHighlightData,
    ];
    console.log("Single span double partial overlap!", overlappedHighlights);
    return overlappedHighlights;
  }
  // const startOffNode = startContainer.splitText(preHighlightData.startOffset);
  // let startHighlightabsoluteStartOffset = calculateAbsoluteStartOffset(startOffNode);

  // const endOffNode = endContainer.splitText(preHighlightData.endOffset);
  // console.log("endOffNode: ", endOffNode);
  // let endHighlightabsoluteStartOffset = calculateAbsoluteStartOffset(endOffNode);

  // Filter for overlaps at the start
  let possibleOverlapsStartSpan = Object.values(masterHighlights).filter(
    hl =>
      hl.startSpanId === startHighlightData.startSpanId &&
      hl.absoluteStartOffset > startHighlightData.absoluteStartOffset
  );

  // Filter for overlaps at the end
  let possibleOverlapsEndSpan = Object.values(masterHighlights).filter(
    hl =>
      hl.startSpanId === endHighlightData.startSpanId &&
      hl.absoluteStartOffset < endHighlightData.absoluteStartOffset
  );
  // console.log("possibleOverlapsStartSpan: ", possibleOverlapsStartSpan);
  // console.log("possibleOverlapsEndSpan: ", possibleOverlapsEndSpan);

  // Extract numerical part of startSpanId for comparison
  const startGroupSpanNum = startHighlightData.startSpanNum;
  const endGroupSpanNum = endHighlightData.startSpanNum;

  // Filter for overlaps in-between
  // let inBetweenOverlaps = pageHighlights[pageNumber].filter(hl => {
  //   return (
  //     hl.startSpanNum > startGroupSpanNum && hl.startSpanNum < endGroupSpanNum
  //   );
  // });
  let inBetweenOverlaps = [];

  // Loop through each page from start to end
  for (
    let pageNum = preHighlightData.startPageNumber;
    pageNum <= preHighlightData.endPageNumber;
    pageNum++
  ) {
    // console.log("pageNum: ", pageNum);
    // console.log(
    //   "preHighlightData.startPageNumber: ",
    //   preHighlightData.startPageNumber
    // );
    // console.log(
    //   "preHighlightData.endPageNumber: ",
    //   preHighlightData.endPageNumber
    // );
    // Filter highlights on each page using the master object
    let pageHighlights = Object.values(masterHighlights).filter(hl => {
      return (
        hl.pageNumber === pageNum && // Ensure we are only looking at highlights for the current page
        hl.startSpanNum > startGroupSpanNum &&
        hl.startSpanNum < endGroupSpanNum
      ); // Your existing logic
    });

    // Append filtered highlights for this page to the overall array
    inBetweenOverlaps.push(...pageHighlights);
    // console.log("pageHighlights: ", pageHighlights);
  }
  // console.log("inBetweenOverlaps: ", inBetweenOverlaps);

  // Combine all overlaps
  let overlappedHighlights = [
    startHighlightData,
    ...possibleOverlapsStartSpan,
    ...inBetweenOverlaps,
    ...possibleOverlapsEndSpan,
    endHighlightData,
  ];

  // Log or further process the overlaps
  return overlappedHighlights;
}
function overlapCheck(preHighlightData) {
  const treeWalker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_ALL,
    null,
    false
  );
  let overlappedHighlights = [];

  const startSpan = document.getElementById(preHighlightData.startSpanId);
  const startContainer = preHighlightData.startContainer;
  let absoluteStartOffset = 0;

  const startOffNode = startContainer.splitText(preHighlightData.startOffset);
  treeWalker.currentNode = startOffNode;
  treeWalker.previousNode();
  while (treeWalker.currentNode !== startSpan) {
    absoluteStartOffset += treeWalker.currentNode.textContent.length;
    treeWalker.previousNode();
  }
  // console.log(
  //   "check point logging pageHighlights: ",
  //   pageHighlights
  // );
  // console.log(
  //   "preHighlightData.startPageNumber: ",
  //   preHighlightData.startPageNumber
  // );
  let possibleOverlaps = Object.values(masterHighlights).filter(
    hl => hl.startSpanId === preHighlightData.startSpanId
  );

  //Deal with single span overlap
  if (preHighlightData.startSpanId == preHighlightData.endSpanId) {
    if (possibleOverlaps) {
      possibleOverlaps.forEach(overlap => {
        if (
          absoluteStartOffset < overlap.absoluteStartOffset &&
          absoluteStartOffset + preHighlightData.highlightedTextLength >
            overlap.absoluteStartOffset + overlap.highlightedTextLength
        ) {
          // Store overlap for future processing
          overlappedHighlights.push(overlap);
          console.log(
            "Overlap detected at start container, single span:",
            overlap
          );
        }
      });
    }

    if (startOffNode.parentNode) {
      startOffNode.parentNode.normalize();
    }
    console.log("overlappedHighlights: ", overlappedHighlights);
    return overlappedHighlights;
  }

  // Traverse the nodes to check for overlaps and collect text length
  treeWalker.currentNode = startOffNode;
  // console.log("current node textcontent: ", treeWalker.currentNode.textContent);
  const endSpan = document.getElementById(preHighlightData.endSpanId);
  let accumulatedTextLength = 0;
  let inHighlightGroupId;
  while (treeWalker.currentNode !== endSpan) {
    // console.log("current node: ", treeWalker.currentNode);
    let current = treeWalker.currentNode;

    if (
      current.nodeType === Node.ELEMENT_NODE &&
      current.classList.contains("highlighted")
    ) {
      let currentGroupId = current.getAttribute("data-highlight-group-id");
      if (inHighlightGroupId != currentGroupId) {
        inHighlightGroupId = currentGroupId;
        let overlaps = Object.values(masterHighlights).filter(
          hl => hl.groupId === currentGroupId
        );
        overlaps.forEach(overlap => {
          overlappedHighlights.push(overlap);
          console.log(
            "Overlap detected inbetween multispan highlight:",
            overlap
          );
        });
      }
      treeWalker.nextNode();
      continue;
    } else if (
      (current.nodeType === Node.ELEMENT_NODE &&
        current.tagName.toLowerCase() === "span" &&
        current.id) ||
      (current.nodeType === Node.ELEMENT_NODE &&
        current.tagName.toLowerCase() === "br")
    ) {
      // Move to the next node without counting the text length
      treeWalker.nextNode();
      continue;
    }
    // Add logic here to handle reaching the last span (endSpanId matching)
    else {
      accumulatedTextLength += current.textContent.length;
    }

    treeWalker.nextNode();
  }

  let absoluteEndOffset =
    preHighlightData.highlightedTextLength - accumulatedTextLength;

  let possibleOverlapsEndSpan = Object.values(masterHighlights).filter(
    hl => hl.startSpanId === preHighlightData.endSpanId
  );
  // console.log("possibleOverlapsEndSpan: ", possibleOverlapsEndSpan);
  possibleOverlapsEndSpan.forEach(overlap => {
    if (overlap.absoluteStartOffset < absoluteEndOffset) {
      // Store overlap for future processing
      overlappedHighlights.push(overlap);
      console.log("Overlap detected at end container:", overlap);
    }
  });

  if (startOffNode.parentNode) {
    startOffNode.parentNode.normalize();
  }

  console.log("overlappedHighlights: ", overlappedHighlights);
  return overlappedHighlights;
}

function undoHighlights(overlappedHighlights) {
  overlappedHighlights.forEach(highlightData => {
    let currentPageNumber = highlightData.startPageNumber;
    let endPageNumber = highlightData.endPageNumber;
    const pageContainer = document.querySelector(
      `.page[data-page-number="${currentPageNumber}"]`
    );
    const groupId = highlightData.groupId;
    const highlightedSpans = pageContainer.querySelectorAll(
      `span.highlighted[data-highlight-group-id="${groupId}"]`
    );
    highlightedSpans.forEach(span => {
      const textNode = document.createTextNode(span.textContent);
      // console.log("textNode: ", textNode);
      span.parentNode.insertBefore(textNode, span);
      span.parentNode.removeChild(span);

      if (textNode.parentNode) {
        textNode.parentNode.normalize();
      }
    });
    removeHighlightsFromPageData(
      pageHighlights[currentPageNumber],
      highlightData.groupId
    );

    while (currentPageNumber != endPageNumber) {
      currentPageNumber++;
      // let highlightOnCurrentPage = pageHighlights[
      //   currentPageNumber
      // ].filter(hl => hl.groupId === highlightData.groupId);
      removeHighlightsFromPageData(
        pageHighlights[currentPageNumber],
        highlightData.groupId
      );

      const pageContainer = document.querySelector(
        `.page[data-page-number="${currentPageNumber}"]`
      );
      const groupId = highlightData.groupId;
      const highlightedSpans = pageContainer.querySelectorAll(
        `span.highlighted[data-highlight-group-id="${groupId}"]`
      );
      highlightedSpans.forEach(span => {
        const textNode = document.createTextNode(span.textContent);
        // console.log("textNode: ", textNode);
        span.parentNode.insertBefore(textNode, span);
        span.parentNode.removeChild(span);

        if (textNode.parentNode) {
          textNode.parentNode.normalize();
        }
      });
    }
  });
  //Delete from master
  overlappedHighlights.forEach(highlight => {
    if (masterHighlights.hasOwnProperty(highlight.groupId)) {
      delete masterHighlights[highlight.groupId];
    }
  });
  console.log("masterHighlights: ", masterHighlights);
}
function removeHighlightsFromPageData(highlights, groupId) {
  for (let i = highlights.length - 1; i >= 0; i--) {
    if (highlights[i].groupId === groupId) {
      console.log("deleting highlight: ", highlights[i]);
      highlights.splice(i, 1);
    }
  }
}

function renderHighlights(pageNumber, pageHighlights) {
  const highlights = pageHighlights[pageNumber];
  if (!highlights) return;

  // Sort highlights by startSpanNum and then by absoluteStartOffset
  highlights.sort((a, b) => {
    if (a.startSpanNum === b.startSpanNum) {
      return a.absoluteStartOffset - b.absoluteStartOffset;
    }
    return a.startSpanNum - b.startSpanNum;
  });

  highlights.forEach(highlight => {
    attemptRender(highlight, 0);
  });
}

function attemptRender(highlight, attempts) {
  const startSpan = document.getElementById(highlight.startSpanId);
  const endSpan = document.getElementById(highlight.endSpanId);

  if (startSpan && endSpan) {
    applyHighlight(highlight, startSpan, endSpan);
  } else if (attempts < 10) {
    setTimeout(() => attemptRender(highlight, attempts + 1), 200);
  } else {
    console.error(
      "Failed to find elements after multiple attempts for highlight:",
      highlight
    );
  }
}

function applyHighlight(highlight, startSpan, endSpan) {
  const startNode = getStartNode(startSpan, highlight.absoluteStartOffset);
  const endNode = getEndNode(endSpan, highlight.absoluteEndOffset);
  const range = document.createRange();
  range.setStart(startNode, highlight.startOffset);
  range.setEnd(endNode, highlight.endOffset);

  if (highlight.startSpanNum === highlight.endSpanNum) {
    highlightSingleSpan(range, highlight.groupId);
  } else {
    highlightMultipleSpans(range, highlight.groupId);
  }
  //Fix here, you're recreating a new highlight with a different groupid
}

export { createHighlight, renderHighlights };
