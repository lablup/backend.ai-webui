import { manipulateGraphQLQueryWithClientDirectives } from './graphql-transformer';

describe('graphql-transformer', () => {
  it('should transform the GraphQL query correctly', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query MyQuery ($yesSkip:Boolean!, $noSkip:Boolean!, $otherNotUsed:String, $oldVersion:String) {
      testQuery  (
        props: {
          name: "asdf",
          age: 32 
        }
      ){
        field10 @skipOnClient(if: $yesSkip)
        filed11 @skipOnClient(if: $noSkip)
        
        field20 @since(version: "99") @required(ACTION:NONE)
        filed21 @since(version: "99")
        field22 @since(version: "100")
        
        field30 @deprecatedSince(version: "99")
        field31 @deprecatedSince(version: "101")
        
        fieldWithSelectionSet @since(version: "99") { 
          insideSelectionSet {
            newField @since(version: "101")
            oldField @since(version: "99")
          }
          insideSelectionSet1{
            newField @since(version: "101")
            newField2 @since(version: "101")
          }
          insideSelectionSet2 @since(version: "101"){
            whatever
          }
          
        }
        
      }
      oldQuery (name:"test") @deprecatedSince(version: "99") {
        my vlalue
      }
    }
  `,
      {
        yesSkip: true,
        noSkip: false,
        oldVersion: '99',
      },
      (version) => {
        if (Array.isArray(version)) {
          return false;
        } else {
          return 100 <= parseInt(version);
        }
      },
    );
    expect(result).toBe(`query MyQuery {
  testQuery(props: {name: "asdf", age: 32}) {
    filed11
    field20 @required(ACTION: NONE)
    filed21
    field31
    fieldWithSelectionSet {
      insideSelectionSet {
        oldField
      }
    }
  }
}`);
  });

  it('@sinceMultiple(@versions:) should transform the GraphQL query correctly', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query MyQuery ($versions1:[String!]!, $versions2:[String!]!) {
      testQuery  (
        props: {
          name: "asdf",
          age: 32 
        }
      ){
        field20 @sinceMultiple(versions: $versions1) @required(ACTION:NONE)
        filed21 @sinceMultiple(versions: $versions2)
        filed30 @sinceMultiple(versions: ["23.09.123", "24.03.124"])
        field31 @since(version: "101")
      }
      oldQuery (name:"test") @sinceMultiple(versions: $versions2) {
        myValue
      }
    }`,
      {
        versions1: ['23.09.9'],
        versions2: ['23.09.9', '24.03.1'],
      },
      (version) => {
        if (Array.isArray(version)) {
          return true;
        } else {
          return false;
        }
      },
    );
    expect(result).toBe(`query MyQuery {
  testQuery(props: {name: "asdf", age: 32}) {
    field31
  }
}`);
  });

  it('@deprecatedSinceMultiple(@versions:) should transform the GraphQL query correctly', () => {
    const result = manipulateGraphQLQueryWithClientDirectives(
      `
    query MyQuery ($versions1:[String!]!, $versions2:[String!]!) {
      testQuery  (
        props: {
          name: "asdf",
          age: 32 
        }
      ){
        deprecatedField1 @deprecatedSince(version: "99")
        deprecatedField2 @deprecatedSinceMultiple(versions: $versions1)
        deprecatedField3 @deprecatedSinceMultiple(versions: $versions2)
      }
      
    }
  `,
      {
        versions1: ['23.09.9'],
        versions2: ['23.09.9', '24.03.1'],
      },
      (version) => {
        if (Array.isArray(version)) {
          return version.length === 2;
        } else {
          return false;
        }
      },
    );
    expect(result).toBe(
      'query MyQuery {\n  testQuery(props: {name: "asdf", age: 32}) {\n    deprecatedField3\n  }\n}',
    );
  });
});
