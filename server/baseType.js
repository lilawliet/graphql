var express = require('express');
var { graphqlHTTP } = require("express-graphql")
var { buildSchema } = require('graphql');


/**
 * getClassMates(classNo: Int!): [String]
 * classNo: Int! 表示classNo是一个非空的整型
 * [String] 表示返回一个字符串数组
 */
var schema = buildSchema(`
    type Account {
        name: String
        age: Int
        sex: String
        department: String
        salary(city: String): Int
    }
    type Query {
        getClassMates(classNo: Int!): [String] 
        account(username: String): Account
    }
`);

var root = {
    getClassMates: ({classNo}) => {
        const obj = {
            31: ['张三', '李四', '王五'],
            61: ['张六', '李七', '王八']
        }
        return obj[classNo];
    },
    account({username}) {
        const name = username;
        const sex = '男';
        const age = 18;
        const department = '开发部';
        const salary = ({city}) => {
            if (city === '北京' || city === '上海' || city === '广州' || city === '深圳') {
                return 10000;
            }
            return 3000;
        }
        return {
            name,
            sex,
            age,
            department,
            salary
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

// 公开文件夹，供用户访问静态资源
app.use(express.static('public'))

app.listen(4000, () => console.log('Now browse to localhost:4000/graphql'));