var express = require('express');
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require('graphql');

/**
 * graphql中必须要一个 Query 方法
 */
var schema = buildSchema(`
    input AccountInput {
        name: String
        age: Int
        sex: String
        department: String
    }
    type Account {
        name: String
        age: Int
        sex: String
        department: String
    }
    type Mutation {
        createAccount(input: AccountInput): Account
        updateAccount(name: ID!, input: AccountInput): Account
    }
    type Query {
        accounts: [Account]
    }
`);


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

const middleware = (req, res, next) => {
    if (req.url.indexOf('/graphql') !== -1 && req.headers.cookie?.indexOf('auth') === -1 || !req.headers.cookie) {
        res.send(JSON.stringify({
            error: "您没有权限访问这个接口"
        }))
        return;
    }
    next();
}

app.use(middleware);

app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    // 调试
    graphiql: true, 
}));

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));