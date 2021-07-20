class Node {
    constructor(source, columnName, columnPath, documentId) {
        this.source = source;
        this.columnName = columnName;
        this.columnPath = columnPath;
        this.documentId = documentId;
        this.edges = [];
    }

    connect(node) {
        this.edges.push(node);
    }
}

export default Node;