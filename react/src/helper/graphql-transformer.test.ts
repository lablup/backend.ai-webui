import { manipulateGraphQLQueryWithClientDirectives } from './graphql-transformer';

describe('graphql-transformer', () => {
  it('should be able to import graphql-ws', () => {
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
    }
  `,
      {
        yesSkip: true,
        noSkip: false,
        oldVersion: '99',
      },
      (version) => {
        return 100 <= parseInt(version);
      },
    );
    console.log(result);
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
}
`);
  });
});
