var express = require('express');
var { graphqlHTTP } = require("express-graphql")
var { buildSchema, GraphQLObjectType, GraphQLString, GraphQLInt, GraphQLSchema } = require('graphql');

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
        return Object.keys(fakeDb).map(key => {
            return fakeDb[key];
        }
    )
    },
    createAccount({input}) {
        // 相当于数据库的保存
        fakeDb[input.name] = input;
        // 返回保存结果
        return fakeDb[input.name];
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