import { FragmentReplacements } from 'graphcool-binding/dist/src/extractFragmentReplacements';
import { GraphcoolLink } from 'graphcool-binding/dist/src/GraphcoolLink';
import { buildFragmentInfo, buildTypeLevelInfo } from 'graphcool-binding/dist/src/prepareInfo';
import { GraphQLResolveInfo, GraphQLSchema } from 'graphql';
import { GraphQLClient } from 'graphql-request';
import { SchemaCache } from 'graphql-schema-cache';
import { delegateToSchema } from 'graphql-tools';
import { sign } from 'jsonwebtoken';

// -------------------
// This should be in graphcool-binding
interface BindingOptions {
  fragmentReplacements?: FragmentReplacements
  endpoint: string
  secret: string
}

interface BaseBindingOptions extends BindingOptions {
  typeDefs: string
}

const schemaCache = new SchemaCache()

class BaseBinding {
  private remoteSchema: GraphQLSchema
  private fragmentReplacements: FragmentReplacements
  private graphqlClient: GraphQLClient

  constructor({
    typeDefs,
    endpoint,
    secret,
    fragmentReplacements} : BaseBindingOptions) {
    
    fragmentReplacements = fragmentReplacements || {}

    const token = sign({}, secret)
    const link = new GraphcoolLink(endpoint, token)

    this.remoteSchema = schemaCache.makeExecutableSchema({
      link,
      typeDefs,
      key: endpoint,
    })

    this.fragmentReplacements = fragmentReplacements

    this.graphqlClient = new GraphQLClient(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
    })
  }

  delegate<T>(operation: 'query' | 'mutation', prop: string, args, info?: GraphQLResolveInfo | string): Promise<T> {
    if (!info) {
      info = buildTypeLevelInfo(prop, this.remoteSchema, operation)
    } else if (typeof info === 'string') {
      info = buildFragmentInfo(prop, this.remoteSchema, operation, info)
    }

    return delegateToSchema(
      this.remoteSchema,
      this.fragmentReplacements,
      operation,
      prop,
      args || {},
      {},
      info,
    )
  }

  async request<T = any>(
    query: string,
    variables?: { [key: string]: any },
  ): Promise<T> {
    return this.graphqlClient.request<T>(query, variables)
  }
}
// -------------------

const typeDefs = `
type Post implements Node {
  id: ID!
  isPublished: Boolean!
  title: String!
  text: String!
}

type Mutation {
  createPost(data: PostCreateInput!): Post!
  updatePost(data: PostUpdateInput!, where: PostWhereUniqueInput!): Post
  deletePost(where: PostWhereUniqueInput!): Post
  upsertPost(where: PostWhereUniqueInput!, create: PostCreateInput!, update: PostUpdateInput!): Post!
  resetData: Boolean
}

interface Node {
  id: ID!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}

type PostConnection {
  pageInfo: PageInfo!
  edges: [PostEdge]
}

input PostCreateInput {
  isPublished: Boolean!
  title: String!
  text: String!
}

type PostEdge {
  node: Post!
  cursor: String!
}

enum PostOrderByInput {
  id_ASC
  id_DESC
  isPublished_ASC
  isPublished_DESC
  title_ASC
  title_DESC
  text_ASC
  text_DESC
}

input PostUpdateInput {
  isPublished: Boolean
  title: String
  text: String
}

input PostWhereInput {
  AND: [PostWhereInput!]
  OR: [PostWhereInput!]
  id: ID
  id_not: ID
  id_in: [ID!]
  id_not_in: [ID!]
  id_lt: ID
  id_lte: ID
  id_gt: ID
  id_gte: ID
  id_contains: ID
  id_not_contains: ID
  id_starts_with: ID
  id_not_starts_with: ID
  id_ends_with: ID
  id_not_ends_with: ID
  isPublished: Boolean
  isPublished_not: Boolean
  title: String
  title_not: String
  title_in: [String!]
  title_not_in: [String!]
  title_lt: String
  title_lte: String
  title_gt: String
  title_gte: String
  title_contains: String
  title_not_contains: String
  title_starts_with: String
  title_not_starts_with: String
  title_ends_with: String
  title_not_ends_with: String
  text: String
  text_not: String
  text_in: [String!]
  text_not_in: [String!]
  text_lt: String
  text_lte: String
  text_gt: String
  text_gte: String
  text_contains: String
  text_not_contains: String
  text_starts_with: String
  text_not_starts_with: String
  text_ends_with: String
  text_not_ends_with: String
}

input PostWhereUniqueInput {
  id: ID
}

type Query {
  posts(where: PostWhereInput, orderBy: PostOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): [Post]!
  post(where: PostWhereUniqueInput!): Post
  postsConnection(where: PostWhereInput, orderBy: PostOrderByInput, skip: Int, after: String, before: String, first: Int, last: Int): PostConnection!
  node(id: ID!): Node
}
`

export enum PostOrderByInput {
  id_ASC = 'id_ASC',
  id_DESC = 'id_DESC',
  isPublished_ASC = 'isPublished_ASC',
  isPublished_DESC = 'isPublished_DESC',
  title_ASC = 'title_ASC',
  title_DESC = 'title_DESC',
  text_ASC = 'text_ASC',
  text_DESC = 'text_DESC'
}

export interface PostUpdateInput {
  isPublished?: Boolean
  title?: String
  text?: String
}

export interface PostWhereInput {
  AND?: Array<PostWhereInput>
  OR?: Array<PostWhereInput>
  id?: ID
  id_not?: ID
  id_in?: Array<ID>
  id_not_in?: Array<ID>
  id_lt?: ID
  id_lte?: ID
  id_gt?: ID
  id_gte?: ID
  id_contains?: ID
  id_not_contains?: ID
  id_starts_with?: ID
  id_not_starts_with?: ID
  id_ends_with?: ID
  id_not_ends_with?: ID
  isPublished?: Boolean
  isPublished_not?: Boolean
  title?: String
  title_not?: String
  title_in?: Array<String>
  title_not_in?: Array<String>
  title_lt?: String
  title_lte?: String
  title_gt?: String
  title_gte?: String
  title_contains?: String
  title_not_contains?: String
  title_starts_with?: String
  title_not_starts_with?: String
  title_ends_with?: String
  title_not_ends_with?: String
  text?: String
  text_not?: String
  text_in?: Array<String>
  text_not_in?: Array<String>
  text_lt?: String
  text_lte?: String
  text_gt?: String
  text_gte?: String
  text_contains?: String
  text_not_contains?: String
  text_starts_with?: String
  text_not_starts_with?: String
  text_ends_with?: String
  text_not_ends_with?: String
}

export interface PostCreateInput {
  isPublished: Boolean
  title: String
  text: String
}

export interface PostWhereUniqueInput {
  id?: ID
}

export interface Node {
  id: ID
}

export interface PostEdge {
  node: Post
  cursor: String
}

export interface PageInfo {
  hasNextPage: Boolean
  hasPreviousPage: Boolean
  startCursor?: String
  endCursor?: String
}

export interface PostConnection {
  pageInfo: PageInfo
  edges?: Array<PostEdge>
}

export interface Post extends Node {
  id: ID
  isPublished: Boolean
  title: String
  text: String
}

/*
The `String` scalar type represents textual data, represented as UTF-8 character sequences. The String type is most often used by GraphQL to represent free-form human-readable text.
*/
export type String = string

/*
The `Int` scalar type represents non-fractional signed whole numeric values. Int can represent values between -(2^31) and 2^31 - 1. 
*/
export type Int = number

/*
The `Boolean` scalar type represents `true` or `false`.
*/
export type Boolean = boolean

/*
The `ID` scalar type represents a unique identifier, often used to refetch an object or as key for a cache. The ID type appears in a JSON response as a String; however, it is not intended to be human-readable. When expected as an input type, any string (such as `"4"`) or integer (such as `4`) input value will be accepted as an ID.
*/
export type ID = string | number

export interface Schema {
  query: Query
  mutation: Mutation
}

export interface Query {
  posts: (args: { where?: PostWhereInput, orderBy?: PostOrderByInput, skip?: Int, after?: String, before?: String, first?: Int, last?: Int }, info?: GraphQLResolveInfo | string) => Promise<Array<Post>>
  post: (args: { where: PostWhereUniqueInput }, info?: GraphQLResolveInfo | string) => Promise<Post | null>
  postsConnection: (args: { where?: PostWhereInput, orderBy?: PostOrderByInput, skip?: Int, after?: String, before?: String, first?: Int, last?: Int }, info?: GraphQLResolveInfo | string) => Promise<PostConnection>
  node: (args: { id: ID }, info?: GraphQLResolveInfo | string) => Promise<Node | null>
}

export interface Mutation {
  createPost: (args: { data: PostCreateInput }, info?: GraphQLResolveInfo | string) => Promise<Post>
  updatePost: (args: { data: PostUpdateInput, where: PostWhereUniqueInput }, info?: GraphQLResolveInfo | string) => Promise<Post | null>
  deletePost: (args: { where: PostWhereUniqueInput }, info?: GraphQLResolveInfo | string) => Promise<Post | null>
  upsertPost: (args: { where: PostWhereUniqueInput, create: PostCreateInput, update: PostUpdateInput }, info?: GraphQLResolveInfo | string) => Promise<Post>
  resetData: (args: {}, info?: GraphQLResolveInfo | string) => Promise<Boolean | null>
}

export class Binding extends BaseBinding {
  
  constructor({ endpoint, secret, fragmentReplacements} : BindingOptions) {
    super({ typeDefs, endpoint, secret, fragmentReplacements});
  }
  
  query: Query = {
    posts: (args, info): Promise<Array<Post>> => super.delegate('query', 'posts', args, info),
    post: (args, info): Promise<Post | null> => super.delegate('query', 'post', args, info),
    postsConnection: (args, info): Promise<PostConnection> => super.delegate('query', 'postsConnection', args, info),
    node: (args, info): Promise<Node | null> => super.delegate('query', 'node', args, info)
  }

  mutation: Mutation = {
    createPost: (args, info): Promise<Post> => super.delegate('mutation', 'createPost', args, info),
    updatePost: (args, info): Promise<Post | null> => super.delegate('mutation', 'updatePost', args, info),
    deletePost: (args, info): Promise<Post | null> => super.delegate('mutation', 'deletePost', args, info),
    upsertPost: (args, info): Promise<Post> => super.delegate('mutation', 'upsertPost', args, info),
    resetData: (args, info): Promise<Boolean | null> => super.delegate('mutation', 'resetData', args, info)
  }
}