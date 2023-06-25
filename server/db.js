const { rejects } = require('assert');
var express = require('express');
var { graphqlHTTP } = require("express-graphql")
var { buildSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = require('graphql');

// https://www.npmjs.com/package/mysql
const mysql = require('mysql');
const { resolve } = require('path');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: '12345678',
    database: 'graphql',
    port: 3306
});


var AccountType = new GraphQLObjectType({
    name: "Account",
    fields: {
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
        sex: { type: GraphQLString },
        department: { type: GraphQLString }
    }
})

var QueryType = new GraphQLObjectType({
    name: "Query",
    fields: {
        account: {
            type: AccountType,
            args: {
                username: { type: GraphQLString }
            },
            resolve: function(_, {username}) {
                const name = username
                const sex = "男"
                const age = 18
                const department = "IT"
                return {
                    name,
                    sex,
                    age,
                    department
                }
            }
        }
    }
})

var schema = new GraphQLSchema({ query: QueryType })

/**
 * 查询语句
 */
// mutation {
//     createAccount(input: {
//       name:"aaa",
//       age: 122,
//       sex:"男",
//       department:"ccc"
//     }) {
//       name
//       age
//       sex
//       department
//     }
//   }
  
//   mutation {
//     updateAccount (id:"ccc", input: {
//       age: 111
//     }) {
//       name
//       age
//     }
//   }
  
//   query {
//     accounts {
//       name
//       age
//       sex
//       department
//     }
//   }

const fakeDb = {};

const root = {
    accounts() {
        return new Promise( (reslove, rejects) => {
            pool.query("select * from account", (err, results)=>{
                if (err) {
                    console.log("出错了," + err.message)
                    return 
                }

                const arr = []
                for (var i = 0; i < results.length; i++) {
                    arr.push({
                        name: results[i].name,
                        sex: results[i].sex,
                        age: results[i].age,
                        department: results[i].department,
                    })
                }

                resolve(arr)
            })
        })
    },
    createAccount({input}) {
        const data = {
            name: input.name,
            sex: input.sex,
            age: input.age,
            department: input.department
        }

        return new Promise((resolve, reject) => {
            pool.query('INSERT INTO account SET ?', data, function (error, results, fields) {
                if (error) reject(error);
                
                console.log('The solution is: ', results);
                resolve(results);
              }
            );
        })


    },
    updateAccount({name, input}) {
        // 相当于数据库的更新
        const updatedAccount = Object.assign({}, fakeDb[name], input);
        fakeDb[name] = updatedAccount;
        // 返回更新结果
        return updatedAccount;
    }   
};

const app = express();


app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    // 调试
    graphiql: true, 
}));

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));