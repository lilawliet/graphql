var express = require('express');
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require('graphql');

var schema = buildSchema(`
    type Account {
        name: String
        age: Int
        sex: String
        department: String
    }
    type Query {
        hello: String
        age: Int
        account: Account
    }
`);

var root = {
    hello: () => {
        return 'Hello world!';
    },
    age: () => {
        return 18;
    },
    account: () => {
        return {
            name: '张三',
            age: 18,
            sex: '男',
            department: '开发部'
        }
    }
};

var app = express();
app.use('/graphql', graphqlHTTP({
    schema: schema,
    rootValue: root,
    // 调试
    graphiql: true, 
}));

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));