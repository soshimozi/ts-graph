import { GeoGraphNode, NavGraphNode, GraphNode } from "./GraphNodeTypes";
import { GeoGraphEdge, NavGraphEdge, GraphEdge } from './GraphEdgeTypes';
import SparseGraph from './SparseGraph';


const {
    GeoCoordinate
} = require('geocoordinate');

function geocalculate(graph: SparseGraph<GeoGraphNode, GeoGraphEdge>, goal: number, from: number): number {
    const fromNode = graph.getNode(from)
    const goalNode = graph.getNode(goal)

    const fromCoordinate = new GeoCoordinate(fromNode.location)
    return fromCoordinate.distanceTo(goalNode.location)
}

function navcalculate(graph: SparseGraph<NavGraphNode, NavGraphEdge>, goal: number, from: number): number {
    const fromNode = graph.getNode(from)
    const toNode = graph.getNode(goal)

    return fromNode.position.distance(toNode.position)
}

function manhattancalculate(graph: SparseGraph<NavGraphNode, NavGraphEdge>, goal: number, from: number): number {
    const fromNode = graph.getNode(from)
    const toNode = graph.getNode(goal)

    return Math.abs(fromNode.position.x - toNode.position.x) + Math.abs(fromNode.position.y - toNode.position.y)
}

export { geocalculate, navcalculate, manhattancalculate }