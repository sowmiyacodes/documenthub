const test = require("node:test");
const assert = require("node:assert/strict");
const {
    selectRelevantChunks,
    splitPagesIntoChunks,
} = require("../ai/utils/documentChunks");

test("splits content into chunks without losing its PDF page number", () => {
    const text = "alpha ".repeat(220);
    const chunks = splitPagesIntoChunks([
        { pageNumber: 2, text },
        { pageNumber: 3, text: "another page" },
        { pageNumber: null, text: "an image with no page reference" },
    ]);

    assert.ok(chunks.length > 3);
    assert.ok(chunks.slice(0, -2).every((chunk) => chunk.pageNumber === 2));
    assert.equal(chunks.at(-2).pageNumber, 3);
    assert.equal(chunks.at(-1).pageNumber, null);
    assert.ok(chunks.every((chunk) => chunk.text.length <= 1000));
});

test("filters low-confidence results and removes duplicate evidence", () => {
    const results = [
        { document_id: "doc-a", similarity: 0.81, chunk_text: "the same relevant contract clause" },
        { document_id: "doc-a", similarity: 0.79, chunk_text: "the same relevant contract clause" },
        { document_id: "doc-b", similarity: 0.72, chunk_text: "a separate relevant renewal clause" },
        { document_id: "doc-c", similarity: 0.09, chunk_text: "unrelated text" },
    ];

    assert.deepEqual(
        selectRelevantChunks(results).map((chunk) => chunk.document_id),
        ["doc-a", "doc-b"]
    );
});

test("limits each document's contribution while retaining cross-document results", () => {
    const results = [
        ...Array.from({ length: 8 }, (_, index) => ({
            document_id: "doc-a",
            similarity: 0.9 - index * 0.01,
            chunk_text: `unique contract evidence clause ${index}`,
        })),
        {
            document_id: "doc-b",
            similarity: 0.5,
            chunk_text: "separate evidence from another document",
        },
    ];

    const selected = selectRelevantChunks(results);
    assert.equal(selected.filter((chunk) => chunk.document_id === "doc-a").length, 4);
    assert.ok(selected.some((chunk) => chunk.document_id === "doc-b"));
});
