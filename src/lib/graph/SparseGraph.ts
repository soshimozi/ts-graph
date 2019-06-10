import {GraphNode} from './GraphNodeTypes';
import {GraphEdge, NavGraphEdge} from './GraphEdgeTypes';

const assert = require('assert');
import * as R from "ramda";

class SparseGraph<TNode extends GraphNode, TEdge extends GraphEdge> {
    private nodes: TNode[] = []
    private edges: TEdge[][] = []
    private nextNodeIndex:number = 0
    private digraph:boolean;

    private uniqueEdge(from:number, to:number):boolean {
        
        return R.none( (a:TEdge) => {
            return a.to == to
        }, this.edges[from])
    }


    private cullInvalidEdges():void {
        for (const curEdgeList of this.edges) {
            for(let edgeListIndex=0; edgeListIndex<this.edges.length; edgeListIndex++) {
                const curEdge = curEdgeList[edgeListIndex]
                if(this.nodes[curEdge.to].index == -1 ||
                    this.nodes[curEdge.from].index == -1) {

                    curEdgeList.splice(edgeListIndex, 1)
                }
            }
        }
    }

    constructor(digraph:boolean) {
        this.nextNodeIndex = 0
        this.digraph = digraph
    }

    isDigraph():boolean {
        return this.digraph
    }

    getNode(idx:number):TNode {
        assert((idx < this.nodes.length && idx >= 0), '<SparseGraph::GetNode>: invalid index')
        return this.nodes[idx]
    }

    getEdge(from:number, to:number):TEdge {

        assert( (from < this.nodes.length)  &&
                (from >=0)                  &&
                this.nodes[from].index != -1,
                '<SparseGraph::GetEdge>: invalid "from" index')

        assert( (to < this.nodes.length)  &&
                (to >=0)                  &&
                this.nodes[to].index != -1,
                '<SparseGraph::GetEdge>: invalid "to" index')

        for(const curEdge of this.edges[from]) {
            if(curEdge.to == to) return curEdge
        }

        assert(0, '<SparseGraph::GetEdge>: edge does not exist')
    }

    getNextFreeNodeIndex():number {
        return this.nextNodeIndex
    }

    addNode(node:TNode):number {
        if (node.index < this.nodes.length) {
          //make sure the client is not trying to add a node with the same ID as
          //a currently active node
          assert (this.nodes[node.index].index == -1, "<SparseGraph::AddNode>: Attempting to add a node with a duplicate ID")
          
          this.nodes[node.index] = node
      
          return this.nextNodeIndex
        } else {
          //make sure the new node has been indexed correctly
          assert (node.index == this.nextNodeIndex, "<SparseGraph::AddNode>:invalid index")
      
          this.nodes.push(node)
          this.edges.push([])
      
          return this.nextNodeIndex++
        }
    }

    removeNode(node:number):void {
        assert(node < this.nodes.length, "<SparseGraph::RemoveNode>: invalid node index")

        //set this node's index to invalid_node_index
        this.nodes[node].index = -1
      
        //if the graph is not directed remove all edges leading to this node and then
        //clear the edges leading from the node
        if (!this.digraph) {
            //visit each neighbour and erase any edges leading to this node
            for (const curEdge of this.edges[node]) {
                for(let curEIndex=0; curEIndex<this.edges[curEdge.to].length; curEIndex++) {
                    const curE = this.edges[curEdge.to][curEIndex]
                    if(curE.to == node)  {
                        this.edges[curEdge.to].splice(curEIndex, 1)
                        break
                    }
                }
            }
        
            //finally, clear this node's edges
            this.edges[node].splice(0, this.edges[node].length)
        } else {
            this.cullInvalidEdges()
        }
    }

    private createEdge(to:number, from:number, cost:number): GraphEdge {
        return new GraphEdge(to, from, cost)
    }

    addEdge(edge:TEdge):void {

        //first make sure the from and to nodes exist within the graph 
        assert( (edge.from < this.nextNodeIndex) && (edge.to < this.nextNodeIndex), "<SparseGraph::AddEdge>: invalid node index")

        //make sure both nodes are active before adding the edge
        if ( (this.nodes[edge.to].index != -1) && 
            (this.nodes[edge.from].index != -1)) {
            
            //add the edge, first making sure it is unique
            if (this.uniqueEdge(edge.from, edge.to)) {
                this.edges[edge.from].push(edge)
            }
        }

        //if the graph is undirected we must add another connection in the opposite
        //direction
        if (!this.digraph) {        
            //check to make sure the edge is unique before adding
            if (this.uniqueEdge(edge.to, edge.from))  {
                let newEdge:TEdge = this.createEdge(edge.to, edge.from, edge.cost) as TEdge;

                newEdge.from = edge.to
                newEdge.to = edge.from
                this.edges[edge.to].push(newEdge)
            }
        }
    }

    removeEdge(from:number, to:number):void {
        assert ( (from < this.nodes.length) && (to < this.nodes.length), "<SparseGraph::RemoveEdge>:invalid node index");

        if (!this.digraph) {
            for(let curEdgeIndex = 0; curEdgeIndex < this.edges[to].length; curEdgeIndex++) {
                let curEdge = this.edges[to][curEdgeIndex]
                if(curEdge.to == from) {
                    this.edges[to].splice(curEdgeIndex, 1)
                }
            }
        }   

        for(let curEdgeIndex = 0; curEdgeIndex < this.edges[from].length; curEdgeIndex++) {
            let curEdge = this.edges[from][curEdgeIndex]
            if(curEdge.to == to) {
                this.edges[to].splice(curEdgeIndex, 1)
            }
        }
    }

    numNodes():number {
        return this.nodes.length
    }

    numActiveNodes():number {
        let count:number = 0

        for(let n of this.nodes) {
            if(n.index != -1) {
                count++
            }
        }

        return count
    }

    numEdges():number {
        let count:number = 0
        for(const e of this.edges) {
            count += e.length
        }

        return count
    }

    isEmpty():boolean {
        return this.nodes.length == 0
    }

    isNodePresent(nd:number):boolean {
        return (nd < this.nodes.length && this.nodes[nd].index != -1)
    }

    isEdgePresent(from:number, to:number):boolean {
        if(this.isNodePresent(from) && this.isNodePresent(to)) {
            for(const curEdge of this.edges[from]) {
                if(curEdge.to === to) return true
            }
        }

        return false
    }

    static *edgeIterator<TNode extends GraphNode, TEdge extends GraphEdge>(graph:SparseGraph<TNode, TEdge>, node:number) : IterableIterator<TEdge> {
        let nodeIndex = node
        yield *graph.edges[nodeIndex]
    }

    static *nodeIterator<TNode extends GraphNode, TEdge extends GraphEdge>(graph:SparseGraph<TNode, TEdge>) : IterableIterator<TNode> {

        let curNode:number

        function getNextValidNode() {
             if (curNode == graph.nodes.length ||  graph.nodes[curNode].index != -1) return;

             while(curNode == -1) {
                curNode++

                if(curNode == graph.nodes.length) break;
             }
        }

        curNode = 0
        getNextValidNode()

        yield graph.nodes[curNode]

        while(curNode < graph.nodes.length) {
            curNode++

            if(curNode == graph.nodes.length) break

            getNextValidNode()

            yield graph.nodes[curNode]
        }
    }

}

export default SparseGraph