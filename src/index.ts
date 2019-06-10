import SparseGraph from './lib/graph/SparseGraph';
import { GeoGraphNode } from './lib/graph/GraphNodeTypes';
import { GeoGraphEdge } from './lib/graph/GraphEdgeTypes';
import AStarSearch from './lib/graph/AStarSearch';
import { geocalculate } from './lib/graph/DistanceFunctions';

const {
    GeoCoordinate
} = require('geocoordinate');


let g = new SparseGraph<GeoGraphNode, GeoGraphEdge>(true);

let node = new GeoGraphNode(g.getNextFreeNodeIndex(), {latitude: 39, longitude: 30}); // 0
g.addNode(node)

node = new GeoGraphNode(g.getNextFreeNodeIndex(), {latitude: 19, longitude: 22}); // 1
g.addNode(node);

node = new GeoGraphNode(g.getNextFreeNodeIndex(), {latitude: 70, longitude: 38}); // 2
g.addNode(node);

node = new GeoGraphNode(g.getNextFreeNodeIndex(), {latitude: 79, longitude: 30}); // 3
g.addNode(node);

node = new GeoGraphNode(g.getNextFreeNodeIndex(), {latitude: 89, longitude: 43}); // 4
g.addNode(node);

function addEdge(from: number, to: number) {
    
    const fromLocation = new GeoCoordinate(g.getNode(from).location)
    let edge:GeoGraphEdge = new GeoGraphEdge(from, to, fromLocation.distanceTo(g.getNode(to).location))
    
    g.addEdge(edge)

    if(!g.isDigraph) {
        const toLocation = new GeoCoordinate(g.getNode(to).location)
        let edge = new GeoGraphEdge(to, from, toLocation.distanceTo(g.getNode(from).location))
        g.addEdge(edge)
    }
}

addEdge(0, 1)
addEdge(0, 2)
addEdge(2, 3)
addEdge(1, 3)
addEdge(2, 4)
addEdge(3, 4)


let search = new AStarSearch(g, 0, 4, geocalculate)
let path = search.getPathToTarget()

console.log('path',path);

