class Graph {
    constructor(node) {
        this.nodes = [];
    }

    addToGraph(...node) {
        this.nodes.push(...node);
    }

    isRelated(start, end) {
        const node = this.nodes.find(node => `${node.source}.${node.columnName}` == start);
        return !!node.edges.find(edge => `${edge.source}.${edge.columnName}` == end)
    }

    noOfRelations(check, count) {
        const node = this.nodes.find(node => `${node.source}.${node.columnName}` == check);
        return node.edges.length === count;
    }
}

export default Graph;