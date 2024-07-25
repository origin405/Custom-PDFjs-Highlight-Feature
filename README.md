# Custom PDF Highlighting Feature for PDF.js

## Table of Contents
1. [Introduction](#introduction)
2. [About This Code](#about-this-code)
3. [How It Works](#how-it-works)
   1. [Text Selection and Range Object Capture](#1-text-selection-and-range-object-capture)
   2. [Highlight Data Creation](#2-highlight-data-creation)
   3. [DOM Manipulation for Highlighting](#3-dom-manipulation-for-highlighting)
   4. [Complex Scenario Handling](#4-complex-scenario-handling)
   5. [Overlap Management](#5-overlap-management)
      - [Partial Overlap Left](#a-partial-overlap-left)
      - [Partial Overlap Right](#b-partial-overlap-right)
      - [Double Partial Overlap](#c-double-partial-overlap)
      - [Complete Overlap](#d-complete-overlap)
   6. [Highlight Persistence and Reapplication](#6-highlight-persistence-and-reapplication)
   7. [Performance Considerations and Optimizations](#7-performance-considerations-and-optimizations)
4. [Conclusion](#conclusion)

## Introduction

This repository contains a custom highlighting feature originally developed for integration with PDF.js, as part of the EchoPDF project. EchoPDF is an AI-powered PDF interaction and management platform that aims to enhance how users engage with PDF documents.

The highlighting feature was conceived and implemented in early 2023 when PDF.js lacked native highlighting capabilities. Our approach was inspired by PDF.js's text search highlighting mechanism, manipulating the text layer to achieve highlighting functionality.

Key points about this project:

1. **Origin**: Developed as a distinguishing feature for EchoPDF, aiming to provide core functionality for serious PDF reading and analysis.

2. **Implementation**: Unlike PDF.js's current annotation-layer-based highlighting (introduced around June 2023), this feature operates by manipulating the text layer directly.

3. **Current Status**: While PDF.js now offers its own highlighting feature, this implementation remains a testament to innovative problem-solving and could still be valuable for specific use cases or as an alternative approach.

4. **Relation to EchoPDF**: Although not currently integrated into EchoPDF due to the emergence of PDF.js's native highlighting, this project showcases the technical capabilities and problem-solving approach behind EchoPDF's development.

5. **Future Considerations**: For production use, it's recommended to explore PDF.js's native highlighting feature. However, this implementation provides insights into text layer manipulation and complex text selection scenarios in PDF documents.

This repository serves as both a technical showcase and a resource for developers interested in understanding alternative approaches to PDF document interaction.


## About This Code

This repository contains the first version of the highlighting feature, implemented with a focus on rapid development and problem-solving. The code effectively demonstrates the logic and approach to handle complex highlighting scenarios in PDFs.

Key points about this implementation:

1. **Development Approach**: The code was written to quickly implement and test the highlighting functionality, prioritizing working solutions over optimized code.

2. **Current State**: This version successfully handles various highlighting scenarios, including overlaps and multi-page selections.

3. **Potential Improvements**: If this were to be used in a production environment, areas for refactoring would include:
   - Improving code readability and organization
   - Optimizing performance for larger documents
   - Enhancing error handling and edge case management
   - Adding comprehensive comments and documentation

4. **Learning Showcase**: This project demonstrates problem-solving skills, ability to work with complex document structures, and implementation of intricate text manipulation logic.

While not currently used in the EchoPDF project due to PDF.js's native highlighting implementation, this code serves as a valuable learning resource and a demonstration of tackling complex PDF interaction challenges.


## How It Works

### 1. **Text Selection and Range Object Capture**

   The highlighting process begins when a user selects text within the PDF document. This selection is captured using the browser's Range object, which provides crucial information about the selected text.

   a. Capturing the Selection:
      - The highlight tool listens for the 'mouseup' event, which indicates the end of a text selection.
      - Upon this event, it retrieves the current selection using `window.getSelection()`.
      - If a valid selection exists, it obtains the Range object with `selection.getRangeAt(0)`.

   b. Range Object Properties:
      - startContainer: The node where the selection begins.
      - endContainer: The node where the selection ends.
      - startOffset: The character offset within the startContainer.
      - endOffset: The character offset within the endContainer.

   c. Handling PDF.js Specifics:
      - The highlight tool is designed to work with PDF.js's text layer, which presents unique challenges.
      - It identifies the specific span elements that contain the selected text.
      - These spans are typically nested within page divs, each representing a page of the PDF.

   d. Cross-Page Selection:
      - The tool checks if the selection spans multiple pages by comparing the page numbers of the start and end containers.
      - This information is crucial for handling multi-page highlights correctly.

   e. Preliminary Overlap Detection:
      - Even at this stage, the highlight tool begins to check for potential overlaps with existing highlights.
      - It examines whether the selection starts or ends within an already highlighted span.

   The Range object, along with the identified span elements and page information, serves as input for creating the highlight data structure in the next step.
   

### 2. **Highlight Data Creation**

   After capturing the text selection, the highlight tool processes this information to create a structured highlight data object. This object contains all the necessary information to apply, store, and later recreate the highlight.

   a. Data Extraction:
      - The tool extracts key information from the Range object and the identified span elements.
      - It calculates absolute offsets within the document, accounting for the PDF's structure.

   b. Highlight Data Structure:
      - groupId: A unique identifier for each highlight (generated using UUID).
      - startSpanId and endSpanId: IDs of the spans where the highlight begins and ends.
      - startOffset and endOffset: Character offsets within the start and end spans.
      - absoluteStartOffset and absoluteEndOffset: Character offsets relative to the entire document.
      - startSpanNum and endSpanNum: Numerical identifiers of the start and end spans.
      - pageNumber: The page number(s) where the highlight appears.
      - highlightedTextLength: The total length of the highlighted text.

   c. Multi-page Handling:
      - For highlights spanning multiple pages, the tool creates separate highlight data objects for each page involved.
      - These objects are linked by their groupId to maintain the relationship between parts of a single highlight.

   d. Overlap Information:
      - The tool includes data about any detected overlaps with existing highlights.
      - This information is crucial for properly handling complex highlighting scenarios.

   The resulting highlight data object serves as a comprehensive representation of the highlight, containing all information necessary for applying the highlight to the document and managing it within the tool's data structures.

   ### 3. **DOM Manipulation for Highlighting**

After creating the highlight data, the tool applies the highlight to the document by manipulating the DOM. This process involves several steps:

a. **Span Creation:**
   - The tool creates new `<span>` elements to wrap the selected text.
   - These spans are given a 'highlighted' class for visual styling.

b. **Attribute Assignment:**
   - Each new span is assigned a `data-highlight-group-id` attribute with the unique groupId.
   - This attribute helps in identifying and managing highlights later.

c. **Text Node Splitting:**
   - If a highlight starts or ends in the middle of a text node, that node is split.
   - This ensures that only the exact selected text is wrapped in the highlight span.

d. **DOM Tree Modification:**
   - The tool carefully inserts the new highlight spans into the DOM.
   - It preserves the original structure of the document while adding the highlights.

e. **Multi-span Handling:**
   - For selections spanning multiple DOM elements, the tool creates separate highlight spans for each affected element.
   - It ensures continuity of the highlight across these spans.

f. **Page Boundary Management:**
   - When a highlight crosses page boundaries, the tool correctly terminates and restarts the highlight at page breaks.

g. **Existing Highlight Interaction:**
   - If the new highlight overlaps with existing ones, the tool adjusts the DOM structure to accommodate this.
   - It may involve merging highlights or creating nested highlight structures.

The result is a visually highlighted section of text in the PDF document, accurately reflecting the user's selection while maintaining the integrity of the document's structure.

### 4. **Complex Scenario Handling**

The highlight tool is designed to handle various complex scenarios that can arise when highlighting text in a PDF document:

a. **Single-span Highlighting:**
   - Manages highlights contained within a single text span.
   - Handles partial highlighting of text nodes within a span.

b. **Multi-span Highlighting:**
   - Deals with selections that span across multiple HTML elements.
   - Ensures continuity of highlighting across different spans and nested structures.

c. **Multi-page Highlighting:**
   - Supports highlights that extend across different pages of the PDF.
   - Correctly terminates and resumes highlights at page boundaries.
   - Maintains logical connection between highlight parts on different pages.

d. **Nested Span Handling:**
   - Manages situations where new highlights interact with existing highlighted areas.
   - Handles creation of highlights within already highlighted text.

e. **Non-contiguous Selection:**
   - Addresses cases where users make non-contiguous text selections.
   - Either splits the selection into multiple separate highlights or connects them as appropriate.

f. **Empty and Whitespace Selections:**
   - Detects and appropriately handles attempts to highlight empty or whitespace-only selections.

g. **Highlight Persistence Across Zoom Levels:**
   - Ensures that highlights remain accurate and visually consistent when users zoom in or out of the PDF.

h. **Text Layer Reflow Handling:**
   - Adapts to any reflow of text that might occur in the PDF.js text layer, maintaining highlight accuracy.

This comprehensive approach to scenario handling ensures that the highlight tool can manage a wide range of user interactions and document structures, providing a robust and reliable highlighting experience.


### 5. **Overlap Management**

#### a. **Partial Overlap Left:**
   This scenario occurs when a new highlight begins within an existing highlighted span and extends beyond it. The challenge here is that the Range object's startOffset is relative to the highlighted span, not the original text node, making it impossible to directly determine the true start position of the new highlight.

   Solution:

   1. Identify the overlap:
   ```javascript
   function overlapLeftCheck(preHighlightData) {
     let overlapHighlightsMaster = [];
     overlapLeftHighlightCheck(preHighlightData, overlapHighlightsMaster);
     return overlapHighlightsMaster;
   }

Traverse the DOM to find overlapped highlights:

```javascript
function overlapLeftHighlightCheck(preHighlightData, overlapHighlightsMaster) {
  const startContainer = preHighlightData.startContainer;
  let startContainerTextNode = getTextNodeFromContainer(startContainer);
  const startOffNode = startContainerTextNode.splitText(preHighlightData.startOffset);
  
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

  while (accumulatedTextLength < highlightedTextLength) {
    let current = treeWalker.currentNode;
    if (current.nodeType === Node.ELEMENT_NODE && 
        current.classList.contains("highlighted") &&
        accumulatedTextLength + current.textContent.length < highlightedTextLength) {
      let currentGroupId = current.getAttribute("data-highlight-group-id");
      if (inHighlightGroupId != currentGroupId) {
        inHighlightGroupId = currentGroupId;
        let overlap = masterHighlights[currentGroupId];
        overlapHighlightsMaster.push(overlap);
      }
    } else {
      accumulatedTextLength += current.textContent.length;
    }
    treeWalker.nextNode();
  }
}
```

Calculate the true start offset:
The tool calculates the absolute start offset by traversing backwards from the selection start point to the beginning of the original text node, accumulating text lengths along the way.
Create a new range for highlighting:

```javascript
function createNewRangeLeftOverlap(preHighlightData, overlappedHighlights) {
  let range = document.createRange();
  let startNode = preHighlightData.startContainer;
  let startOffset = preHighlightData.startOffset;
  let endHighlightData = overlappedHighlights.at(-1);
  let endNode = document.getElementById(endHighlightData.endSpanId).firstChild;
  let endOffset = (startNode === endNode) 
    ? endHighlightData.absoluteStartOffset + endHighlightData.highlightedTextLength
    : endHighlightData.endOffset;

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}
```
This solution allows the highlight tool to accurately create a new highlight that starts within an existing highlight and extends beyond it, by:

Identifying the overlap
Traversing the DOM to find all affected highlights
Calculating the true start position relative to the original text
Creating a new range that encompasses both the overlapped portion and the extension

This approach demonstrates a deep understanding of DOM manipulation, range objects, and the complexities of nested text structures in PDF.js rendered documents.

#### b. **Partial Overlap Right:**
   This scenario occurs when a new highlight begins before an existing highlight and ends within it. The challenge here is that the Range object's endOffset is relative to the highlighted span, not the original text node.

   Key Differences from Partial Overlap Left:
   1. Direction of traversal: The tool traverses the DOM from right to left.
   2. End offset calculation: The focus is on determining the true end position of the new highlight.

   Solution Highlights:

   1. Identify and traverse:
   ```javascript
   function overlapRightCheck(preHighlightData) {
     let overlapHighlightsMaster = [];
     overlapRightHighlightCheck(preHighlightData, overlapHighlightsMaster);
     return overlapHighlightsMaster;
   }

   function overlapRightHighlightCheck(preHighlightData, overlapHighlightsMaster) {
     const endContainer = preHighlightData.endContainer;
     let endContainerTextNode = getTextNodeFromContainer(endContainer);
     const endOffNode = endContainerTextNode.splitText(preHighlightData.endOffset);

     // Similar traversal logic as leftOverlap, but in reverse
     // ...
   }
   ```
   2. Calculate true end offset:
      The tool accumulates text lengths while traversing backwards, considering both highlighted and non-highlighted portions.
   4. Create new range:

```javascript
function createNewRangeRightOverlap(preHighlightData, overlappedHighlights) {
  let range = document.createRange();
  let startHighlightData = overlappedHighlights.at(-1);
  let startNode = document.getElementById(startHighlightData.startSpanId).lastChild;
  let startOffset = startHighlightData.startOffset;
  let endNode = document.getElementById(preHighlightData.endSpanId).firstChild;
  
  let endOffset = (startHighlightData.startSpanId === preHighlightData.endSpanId)
    ? startHighlightData.startOffset + preHighlightData.highlightedTextLength + preHighlightData.startOffset
    : preHighlightData.absoluteEndOffset;

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}
```

c. **Double Partial Overlap:**
   This scenario occurs when a new highlight overlaps with existing highlights on both its left and right sides. It's essentially a combination of the previous two scenarios, but with additional complexities.

   Unique Challenges:
   1. Identifying multiple overlapped highlights
   2. Handling potential nested overlaps
   3. Correctly determining the true start and end positions of the new highlight

   Solution Highlights:

   1. Identify overlaps on both sides:
   ```javascript
   function overlapLeftAndRightCheck(preHighlightData) {
     const startParentSpan = getParentSpan(preHighlightData.startContainer);
     const endParentSpan = getParentSpan(preHighlightData.endContainer);

     const startGroupId = startParentSpan.getAttribute("data-highlight-group-id");
     const endGroupId = endParentSpan.getAttribute("data-highlight-group-id");

     // Handle single span double partial overlap
     if (startGroupId === endGroupId) {
       // ... handle this special case
     }

     // Identify overlaps
     let possibleOverlapsStartSpan = Object.values(masterHighlights).filter(
       hl => hl.startSpanId === startHighlightData.startSpanId &&
             hl.absoluteStartOffset > startHighlightData.absoluteStartOffset
     );

     let possibleOverlapsEndSpan = Object.values(masterHighlights).filter(
       hl => hl.startSpanId === endHighlightData.startSpanId &&
             hl.absoluteStartOffset < endHighlightData.absoluteStartOffset
     );

     // ... additional logic for in-between overlaps
   }
```

  2. Handle nested overlaps:
  The function checks for and manages highlights that might be completely engulfed by the new selection.
  3. Create new range considering all overlaps:

```javascript
function createNewRangeDoubleOverlap(preHighlightData, overlappedHighlights) {
  let range = document.createRange();
  let startHighlight = overlappedHighlights.at(0);
  let endHighlight = overlappedHighlights.at(-1);

  let startSpan = document.getElementById(startHighlight.startSpanId);
  let startNode = getStartNode(startSpan, startHighlight.absoluteStartOffset);
  let startOffset = startHighlight.startOffset;

  let endSpan = document.getElementById(endHighlight.endSpanId);
  let endNode = getEndNode(endSpan, endHighlight.absoluteEndOffset);

  let startNodeStartOffset = (startHighlight.startSpanId == startHighlight.endSpanId) 
    ? startHighlight.startOffset 
    : 0;

  let endOffset;
  if (startHighlight.endSpanId === endHighlight.endSpanId) {
    endOffset = startNodeStartOffset + preHighlightData.startOffset + 
                preHighlightData.highlightedTextLength + 
                endHighlight.highlightedTextLength - 
                preHighlightData.endOffset;
  } else {
    endOffset = endHighlight.absoluteEndOffset;
  }

  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  return range;
}
```
This solution demonstrates:
- Comprehensive overlap detection across multiple spans and pages
- Careful handling of nested highlight scenarios
- Precise calculation of start and end positions considering all overlapped highlights
- Adaptability to various complex overlap configurations

d. **Complete Overlap:**
   This scenario occurs when a new highlight completely encompasses one or more existing highlights. While it might seem simpler than partial overlaps, it presents unique challenges in terms of maintaining highlight integrity and handling nested structures.

   Key Challenges:
   1. Identifying all fully encompassed highlights
   2. Handling nested highlight structures
   3. Maintaining the integrity of non-overlapped portions of existing highlights

   Solution Highlights:

   1. Detect complete overlaps:
   ```javascript
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
     let absoluteStartOffset = calculateAbsoluteStartOffset(startSpan, startContainer, preHighlightData.startOffset);

     // Traverse the DOM to find completely overlapped highlights
     while (treeWalker.currentNode !== document.getElementById(preHighlightData.endSpanId)) {
       let current = treeWalker.currentNode;
       if (current.nodeType === Node.ELEMENT_NODE && current.classList.contains("highlighted")) {
         let currentGroupId = current.getAttribute("data-highlight-group-id");
         let overlap = masterHighlights[currentGroupId];
         if (isCompletelyOverlapped(overlap, absoluteStartOffset, preHighlightData)) {
           overlappedHighlights.push(overlap);
         }
       }
       treeWalker.nextNode();
     }

     return overlappedHighlights;
   }

   function isCompletelyOverlapped(existingHighlight, newStartOffset, newHighlightData) {
     return newStartOffset <= existingHighlight.absoluteStartOffset &&
            (newStartOffset + newHighlightData.highlightedTextLength) >= 
            (existingHighlight.absoluteStartOffset + existingHighlight.highlightedTextLength);
   }
```

  2 Handle nested structures:
  The solution considers the possibility of highlights nested within other highlights, ensuring that all levels of nesting are properly addressed.
  3. Maintain highlight integrity:

```javascript
function resolveCompleteOverlap(newHighlightData, overlappedHighlights) {
  // Remove completely overlapped highlights
  undoHighlights(overlappedHighlights);

  // Create new highlight
  const range = document.createRange();
  const startNode = document.getElementById(newHighlightData.startSpanId).firstChild;
  const endNode = document.getElementById(newHighlightData.endSpanId).firstChild;
  
  range.setStart(startNode, newHighlightData.startOffset);
  range.setEnd(endNode, newHighlightData.endOffset);

  if (startNode === endNode) {
    highlightSingleSpan(range, newHighlightData.groupId);
  } else {
    highlightMultipleSpans(range, newHighlightData.groupId);
  }
}
```
This approach to handling complete overlaps demonstrates:

- Efficient DOM traversal to identify all affected highlights
- Careful consideration of nested highlight structures
- Ability to maintain data integrity while modifying complex DOM structures
- Seamless integration with existing highlight creation methods (highlightSingleSpan and highlightMultipleSpans)

The complete overlap solution rounds out the highlight tool's capability to handle all possible overlap scenarios, ensuring robust and consistent behavior regardless of how users interact with the document.


### 6. **Highlight Persistence and Reapplication**

After creating highlights and managing overlaps, the next crucial aspect is ensuring that highlights persist across page reloads and can be accurately reapplied. This involves storing highlight data and efficiently rendering stored highlights when the document is reopened.

a. **Storing Highlight Data:**
   The tool stores highlight data in two main structures:

   1. Page-specific highlights:
   ```javascript
   let pageHighlights = {};

   function addHighlightToPage(pageNumber, highlightData) {
     if (!pageHighlights[pageNumber]) {
       pageHighlights[pageNumber] = [];
     }
     pageHighlights[pageNumber].push(highlightData);
   }
```
  2. Master highlights object:

```javascript
let masterHighlights = {};

// In highlight creation function
masterHighlights[groupId] = highlightData;
```

This dual storage approach allows for efficient page-specific operations while maintaining a global view of all highlights.

b. Rendering Stored Highlights:
The tool employs a robust system to reapply highlights when a document is reopened:

```javascript
function renderHighlights(pageNumber, pageHighlights) {
  const highlights = pageHighlights[pageNumber];
  if (!highlights) return;

  // Sort highlights to ensure correct rendering order
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
    // Retry rendering if spans are not yet available
    setTimeout(() => attemptRender(highlight, attempts + 1), 200);
  } else {
    console.error("Failed to render highlight after multiple attempts:", highlight);
  }
}
```

c. Handling PDF.js Page Rendering:
The tool accounts for PDF.js's dynamic page rendering:

```javascript
function observePageLoads() {
  const viewer = document.getElementById("viewer");
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === "attributes" && mutation.attributeName === "data-loaded") {
        const pageElement = mutation.target;
        applyHighlightsToPage(pageElement);
      }
    });
  });

  observer.observe(viewer, {
    attributes: true,
    childList: false,
    subtree: true,
    attributeFilter: ["data-loaded"]
  });
}

function applyHighlightsToPage(pageElement) {
  if (pageElement.getAttribute("data-loaded") === "true") {
    const pageNumber = pageElement.getAttribute("data-page-number");
    if (pageHighlights[pageNumber] && pageHighlights[pageNumber].length > 0) {
      renderHighlights(pageNumber, pageHighlights);
    }
  }
}
```
This system demonstrates:

- Efficient data storage and retrieval mechanisms
- Robust handling of asynchronous page loading in PDF.js
- Careful ordering of highlight rendering to maintain integrity
- Error handling and retry logic for reliable highlight application


### 7. **Performance Considerations and Optimizations**

Implementing a robust highlighting system for PDF documents comes with significant performance challenges, especially when dealing with large documents or numerous highlights. This section outlines the key performance considerations and optimizations implemented in the highlight tool.

a. **Efficient DOM Traversal:**
   The tool uses TreeWalker for efficient DOM traversal, significantly reducing the time complexity of operations like overlap detection:

   ```javascript
   const treeWalker = document.createTreeWalker(
     document.body,
     NodeFilter.SHOW_ALL,
     { acceptNode: customFilter },
     false
   );

   function customFilter(node) {
     if (node.nodeType === Node.TEXT_NODE) {
       return NodeFilter.FILTER_ACCEPT;
     }
     if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === "span") {
       return NodeFilter.FILTER_ACCEPT;
     }
     return NodeFilter.FILTER_SKIP;
   }
   ```

This approach allows for quick navigation through relevant nodes, skipping unnecessary elements.

b. **Optimized Data Structures:** 
   The use of both `pageHighlights` and `masterHighlights` objects allows for efficient access and manipulation of highlight data:

   ```javascript
   let pageHighlights = {};
   let masterHighlights = {};
   ```

   This dual structure enables quick page-specific operations while maintaining a global view for complex scenarios.

c. **Lazy Rendering:** 
   Highlights are rendered only when a page becomes visible, reducing initial load time and memory usage:

   ```javascript
   function applyHighlightsToPage(pageElement) {
     if (pageElement.getAttribute("data-loaded") === "true") {
       const pageNumber = pageElement.getAttribute("data-page-number");
       if (pageHighlights[pageNumber] && pageHighlights[pageNumber].length > 0) {
         renderHighlights(pageNumber, pageHighlights);
       }
     }
   }
   ```

d. **Batched DOM Updates:** 
   When applying multiple highlights, DOM updates are batched to minimize reflows and repaints:

   ```javascript
   function highlightMultipleSpans(spans, range, groupId, highlightData) {
     const fragment = document.createDocumentFragment();
     spans.forEach(span => {
       // Create highlighted span
       const highlightedSpan = createHighlightedSpan(span, range, groupId);
       fragment.appendChild(highlightedSpan);
     });
     // Single DOM update
     spans[0].parentNode.insertBefore(fragment, spans[0]);
     spans.forEach(span => span.remove());
   }
   ```

e. **Memoization of Calculations:** 
   Frequently used calculations, like absolute offsets, are stored to avoid redundant computations:

   ```javascript
   function calculateAbsoluteStartOffset(startNode) {
     if (startNode.hasAttribute('data-absolute-offset')) {
       return parseInt(startNode.getAttribute('data-absolute-offset'));
     }
     let absoluteStartOffset = 0;
     let currentNode = startNode;
     while (currentNode.previousSibling) {
       currentNode = currentNode.previousSibling;
       absoluteStartOffset += currentNode.textContent.length;
     }
     startNode.setAttribute('data-absolute-offset', absoluteStartOffset.toString());
     return absoluteStartOffset;
   }
   ```

f. **Asynchronous Processing:** 
   Heavy computations are made asynchronous to prevent UI freezing:

   ```javascript
   function processLargeDocument(document) {
     return new Promise(resolve => {
       setTimeout(() => {
         // Perform heavy computations here
         resolve(result);
       }, 0);
     });
   }
   ```

g. **Optimized Overlap Detection:** 
   The overlap detection algorithm is optimized to quickly identify potential overlaps before performing detailed checks:

   ```javascript
   function quickOverlapCheck(newHighlight, existingHighlight) {
     return !(newHighlight.endOffset <= existingHighlight.startOffset || 
              newHighlight.startOffset >= existingHighlight.endOffset);
   }
   ```

## Conclusion

This custom PDF highlighting tool represents an exercise in initiative and problem-solving in the face of a perceived gap in existing PDF interaction capabilities. While it may not be the optimal solution for production use, particularly in light of recent developments in PDF.js, it serves as a valuable demonstration of several key aspects of software development:

1. **Initiative in Feature Development**: The project showcases the ability to identify a need and create a custom solution from scratch, a valuable skill in any development role.

2. **Complex Problem Solving**: The intricate logic required to handle various highlighting scenarios, including overlaps and multi-page selections, demonstrates advanced problem-solving capabilities and a deep understanding of DOM manipulation.

3. **Adaptation to Specific Environments**: The tool's integration with PDF.js's rendering process highlights the ability to work within and adapt to complex, existing systems.

Lessons Learned:

1. **The Importance of Pivoting**: In hindsight, switching to an annotation-layer based approach midway through development might have been more efficient. This experience underscores the importance of being willing to pivot when a better solution becomes apparent, even if it means discarding existing work.

2. **Foresight in Integration Challenges**: The difficulties encountered when attempting to integrate this tool with a React-wrapped PDF.js implementation highlight the importance of considering the broader context and potential future integration points during the initial design phase.

3. **Staying Informed of Developments**: The subsequent release of PDF.js's own annotation highlight feature emphasizes the need to stay current with developments in relevant technologies and libraries.

While this highlighting tool may not see production use due to the availability of superior methods (namely, annotation-layer based highlighting), its development has been a valuable learning experience. It has provided deep insights into DOM manipulation, PDF.js rendering processes, and the complexities of text selection and highlighting logic.

Moreover, the project serves as a testament to the ability to conceptualize and implement complex features from scratch given time and necessity. This capacity for independent problem-solving and feature development is a crucial skill in software engineering, demonstrating the potential to contribute meaningfully to projects that require custom solutions or interactions with complex document structures.

Ultimately, while the specific implementation may not be used, the knowledge gained and the demonstration of initiative and problem-solving skills make this project a valuable addition to a developer's portfolio.

