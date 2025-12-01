import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { gql } from 'graphql-tag';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/mock-db';
import { NextRequest } from 'next/server';

const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    subscriptionPlan: String!
    emailVerified: Boolean!
  }

  type Tenant {
    id: ID!
    name: String!
    subscriptionPlan: String!
    usageCount: Int!
    usageLimit: Int!
  }

  type Job {
    id: ID!
    type: String!
    status: String!
    progress: Int!
    inputFiles: [String!]!
    outputFiles: [String!]!
    error: String
    createdAt: String!
    completedAt: String
  }

  type Query {
    me: User
    myJobs: [Job!]!
    job(id: ID!): Job
    tenant: Tenant
  }

  type Mutation {
    updateProfile(name: String!): User!
  }
`;

const resolvers = {
  Query: {
    me: async (_: any, __: any, context: any) => {
      return context.user;
    },
    myJobs: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return db.getJobsByUserId(context.user.id);
    },
    job: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      const job = db.getJobById(id);
      if (!job || job.userId !== context.user.id) {
        throw new Error('Job not found');
      }
      return job;
    },
    tenant: async (_: any, __: any, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      return db.getTenantById(context.user.tenantId);
    },
  },
  Mutation: {
    updateProfile: async (_: any, { name }: { name: string }, context: any) => {
      if (!context.user) throw new Error('Unauthorized');
      const updated = db.updateUser(context.user.id, { name });
      if (!updated) throw new Error('Update failed');
      return updated;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req: NextRequest) => {
    const user = await getSession();
    return { user };
  },
});

export async function GET(request: NextRequest) {
  return handler(request);
}

export async function POST(request: NextRequest) {
  return handler(request);
}
