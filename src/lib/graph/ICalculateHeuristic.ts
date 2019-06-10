import { GraphEdge } from "./GraphEdgeTypes"
import { GraphNode } from './GraphNodeTypes'
import SparseGraph from './SparseGraph'

interface ICalculateHeuristic<TNode extends GraphNode, TEdge extends GraphEdge> {
    (graph:SparseGraph<TNode, TEdge>, target:number, start:number):number
}

export default ICalculateHeuristic