import { GraphNode } from "./GraphNodeTypes";
import { GraphEdge } from './GraphEdgeTypes';
import SparseGraph from './SparseGraph';
import * as R from "ramda";
import { IndexedPriorityQLow } from '../collections/IndexPriorityQLow';
import ICalculateHeuristic from './ICalculateHeuristic'

class AStarSearch<TNode extends GraphNode, TEdge extends GraphEdge> {
    private m_Graph:SparseGraph<TNode, TEdge>
    
    //indexed into by node. Contains the 'real' accumulative cost to that node
    private m_GCosts:number[]

    //indexed into by node. Contains the cost from adding m_GCosts[n] to
    //the heuristic cost from n to the target node. This is the vector the
    //iPQ indexes into.
    private m_FCosts:number[]

    private m_ShortestPathTree:TEdge[] = []
    private m_SearchFrontier:TEdge[] = []

    private m_iSource:number
    private m_iTarget:number
    private m_calculate:ICalculateHeuristic<TNode, TEdge>
    
    constructor(graph:SparseGraph<TNode, TEdge>, source:number, target:number,  calculate:ICalculateHeuristic<TNode, TEdge>) {
        this.m_Graph = graph

        for(let i=0; i<graph.numNodes(); i++) {
            this.m_ShortestPathTree.push(null);
            this.m_SearchFrontier.push(null);
        }

        this.m_GCosts = R.repeat(0.0, graph.numNodes())
        this.m_FCosts = R.repeat(0.0, graph.numNodes())
        this.m_iSource = source
        this.m_iTarget = target
        this.m_calculate = calculate

        this.search()
    }

    private search() {

        //create an indexed priority queue of nodes. The nodes with the
        //lowest overall F cost (G+H) are positioned at the front.
        let pq = new IndexedPriorityQLow(this.m_FCosts, this.m_Graph.numNodes());

        //put the source node on the queue
        pq.insert(this.m_iSource)
        while(!pq.empty()) {

            //get lowest cost node from the queue
            const NextClosestNode:number = pq.Pop()

            //move this node from the frontier to the spanning tree
            this.m_ShortestPathTree[NextClosestNode] = this.m_SearchFrontier[NextClosestNode]

            //if the target has been found exit
            if (NextClosestNode == this.m_iTarget) return

            //now to test all the edges attached to this node
            let egeItr = SparseGraph.edgeIterator(this.m_Graph, NextClosestNode)

            for(const pE of egeItr) {

                //calculate the heuristic cost from this node to the target (H)                       
                const HCost:number = this.m_calculate(this.m_Graph, this.m_iTarget, pE.to) 

                //calculate the 'real' cost to this node from the source (G)
                const GCost:number = this.m_GCosts[NextClosestNode] + pE.cost

                //if the node has not been added to the frontier, add it and update
                //the G and F costs
                if (this.m_SearchFrontier[pE.to] == null)
                {
                    this.m_FCosts[pE.to] = GCost + HCost;
                    this.m_GCosts[pE.to] = GCost;

                    pq.insert(pE.to);

                    this.m_SearchFrontier[pE.to] = pE;
                }

                //if this node is already on the frontier but the cost to get here
                //is cheaper than has been found previously, update the node
                //costs and frontier accordingly.
                else if ((GCost < this.m_GCosts[pE.to]) && (this.m_ShortestPathTree[pE.to]==null))
                {
                    this.m_FCosts[pE.to] = GCost + HCost;
                    this.m_GCosts[pE.to] = GCost;

                    pq.changePriority(pE.to);

                    this.m_SearchFrontier[pE.to] = pE;
                }            
            }
        }
    }

    public getSPT():TEdge[] { return this.m_ShortestPathTree }

    public getPathToTarget():number[] {
        const path: number[] = []

        //just return an empty path if no target or no path found
        if (this.m_iTarget < 0)  return path;
      
        let nd = this.m_iTarget;
      
        path.push(nd);
          
        while ((nd != this.m_iSource) && (this.m_ShortestPathTree[nd] != null)) {
          nd = this.m_ShortestPathTree[nd].from
          path.push(nd);
        }
      
        return R.reverse(path);
    }

    public getCostToTarget():number {
        return this.m_GCosts[this.m_iTarget]
    }

}

export default AStarSearch