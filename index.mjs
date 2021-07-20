import { MongoClient } from 'mongodb';
import fs from 'fs';

import Graph from './Graph.mjs';
import Node from './Nodes.mjs';

const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'mysql_111343282';

const obj = {}

async function main() {
    // Use connect method to connect to the server
    await client.connect()
    console.log('Connected successfully to server')
    const db = client.db(dbName)
    // const collection =  await db.collection('financial').find({}).toArray();
    const collection = [];
    const graph = new Graph();
    //fetch all the collections in the DB
    const temp = (await db.listCollections().toArray())
        .filter(doc => doc.type == 'collection')
        .map(doc => doc.name);
    //based on the collections, fetch all the data stored in them
    for(let i=0; i< temp.length - 1; i++) {
        const _ = await db.collection(temp[i]).find({}).toArray();
        collection.push(..._);
    }
    //iterate through the documents
    collection.forEach(doc => {
        const colInfo = doc.columnsInfo;
        colInfo.forEach(col => {
            const relations = col.relations;
            if(relations){
                //create a node for the parent
                const node = new Node(`${dbName}.${doc._id}`, col.columnName, col.path, doc._id);
                if(!obj.hasOwnProperty(`${node.source}.${node.columnName}`)) {
                    obj[`${node.source}.${node.columnName}`] = node; // an object to keep track of the nodes that are created.
                    const relation = [];
                    relations.forEach(rel => {
                        const relationColName = rel.column.split('|')[1];
                        const docId = rel.source.split('.').splice(1).join('.')
                        let node1;                        
                        if(!obj.hasOwnProperty(`${rel.source}.${relationColName}`)) {
                            node1 = new Node(rel.source, relationColName, rel.column, docId);
                            obj[`${node1.source}.${node1.columnName}`] = node1;
                        } else {
                            node1 = obj[`${rel.source}.${relationColName}`]
                        }
                        node.connect(node1); // connect the child with the parent.
                        relation.push(node1); // create separate node for the children
                    });
                    graph.addToGraph(node);
                    graph.addToGraph(...relation);
                }
            }
        });        
    });

    // console.log(JSON.stringify(graph));

    fs.writeFileSync(`${new Date()}.json`, JSON.stringify(graph), 'utf8'); // create the structure in a file

    //Tests to check if the relations are mapped
    console.log(graph.isRelated('mysql_111343282.financial.disp.account_id', 'mysql_111343282.financial.loan.duration')); //true
    console.log(graph.isRelated('mysql_111343282.financial.order.account_to', 'mysql_111343282.financial.trans.account')); //true
    console.log(graph.isRelated('mysql_111343282.financial.order.order_id', 'mysql_111343282.imdb.roles.actor_id')); //true
    console.log(graph.isRelated('mysql_111343282.imdb.actors.first_name', 'mysql_111343282.imdb.roles.role')); //true
    console.log(graph.isRelated('mysql_111343282.imdb.actors.first_name', 'mysql_111343282.financial.trans.amount')); //false
    return 'done.'
}

main()
.then(console.log)
.catch(console.error)
.finally(() => client.close())