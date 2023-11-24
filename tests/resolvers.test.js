const { graphql } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const resolvers = require('../index.js');

const typeDefs = `
type Query {
  user(id: ID!): User
  usersByName(name: String!): [User]
  users: [User]
  post(id: ID!): Post
  posts: [Post]
  projet(id: ID!): Projet
  projets: [Projet]
}

type Mutation {

  generateAuthToken(
    userId: ID!
    ): AuthToken

  addPost(
    title: String!, 
    content: String!, 
    authorId: ID!
  ): Post

  addUser(
    name: String!,
    email: String!,
    statut: String!
  ): User

  addProjet(
    title : String!,
    content: String!,
    proprietaireId: ID!
  ): Projet

  updateUser(
    id: ID!,
    name: String,
    email: String
    ): User

  updatePost(
    id: ID!,
    title: String,
    content: String
    ): Post

  updateProjet(
    id: ID!,
    title: String,
    content: String
    ): Projet

  deleteUser(
    id: ID!
    ): User
    
  deletePost(
    id: ID!
    ): Post

  deleteProjet(
    id: ID!
    ): Projet  
}

type AuthToken {
  token: String
}

type User {
  id: ID!
  statut: String
  name: String
  email: String
  posts: [Post]
  projets: [Projet]
}

type Post {
  id: ID!
  title: String
  content: String
  author: User
}

type Projet {
  id: ID!
  title: String
  content: String
  proprietaire: User
}
`;

const schema = makeExecutableSchema({ typeDefs, resolvers });

describe('Test des résolveurs GraphQL', () => {
  test('Test de la résolution de la requête utilisateur', async () => {
    const query = `
      query {
        user(id: "0") {
          id
          name
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, query, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Recherche d\'utilisateurs par nom', async () => {
    const query = `
      query {
        usersByName(name: "Alice") {
          id
          name
          email
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, query, null, context);
    expect(result).toMatchSnapshot();
    });

  test('Test de la résolution de la requête post', async () => {
    const query = `
      query {
        post(id: "0") {
          id
          title
          content
          author {
            id
            name
          }
        }
      }
    `;
  
    const context = { userId: '2' };
  
    const result = await graphql(schema, query, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête projet', async () => {
    const query = `
      query {
        projet(id: "0") {
          id
          title
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, query, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête users', async () => {
    const query = `
      query {
        users {
          id
          name
          posts {
            id
            title
          }
          projets {
            id
            title
          }
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, query, null, context);
    expect(result).toMatchSnapshot();
});

test('Test de la résolution de la requête posts', async () => {
  const query = `
    query {
      posts {
        id
        title
        content
        author {
          id
          name
        }
      }
    }
  `;

  const context = { userId: '2' };

  const result = await graphql(schema, query, null, context);
  expect(result).toMatchSnapshot();
});

test('Test de la résolution de la requête projets', async () => {
  const query = `
    query {
      projets {
        id
        title
        content
        proprietaire {
          id
          name
        }
      }
    }
  `;

  const context = { userId: '2' };

  const result = await graphql(schema, query, null, context);
  expect(result).toMatchSnapshot();
});


  test('Test de la mutation pour ajouter un utilisateur', async () => {
    const mutation = `
      mutation {
        addUser(name: "NouvelUtilisateur", email: "nouvel@example.com", statut: "user") {
          id
          name
          statut
        }
      }
    `;

    const context = { userId: '2', statut: 'admin' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête addPost', async () => {
    const mutation = `
      mutation {
        addPost(title: "Nouveau Post", content: "Contenu du nouveau post", authorId: "2") {
          id
          title
          content
          author {
            id
            name
          }
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête addUser', async () => {
    const mutation = `
      mutation {
        addUser(name: "Nouvel Utilisateur", email: "nouvel@utilisateur.com", statut: "user") {
          id
          name
          email
          statut
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
});

  test('Test de la résolution de la requête addProjet', async () => {
    const mutation = `
      mutation {
        addProjet(title: "Nouveau Projet", content: "Contenu du nouveau projet", proprietaireId: "2") {
          id
          title
          content
          proprietaire {
            id
            name
          }
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête updateUser', async () => {
    const mutation = `
      mutation {
        updateUser(id: "2", name: "Nouveau Nom", email: "nouveau@email.com") {
          id
          name
          email
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête updatePost', async () => {
    const mutation = `
      mutation {
        updatePost(id: "1", title: "Nouveau Titre", content: "Nouveau Contenu") {
          id
          title
          content
          author {
            id
            name
          }
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête updateProjet', async () => {
    const mutation = `
      mutation {
        updateProjet(id: "1", title: "Nouveau Titre", content: "Nouveau Contenu") {
          id
          title
          content
          proprietaire {
            id
            name
          }
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête deleteUser', async () => {
    const mutation = `
      mutation {
        deleteUser(id: "2") {
          id
          name
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
});

  test('Test de la résolution de la requête deletePost', async () => {
    const mutation = `
      mutation {
        deletePost(id: "1") {
          id
          title
          content
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

  test('Test de la résolution de la requête deleteProjet', async () => {
    const mutation = `
      mutation {
        deleteProjet(id: "1") {
          id
          title
          content
        }
      }
    `;

    const context = { userId: '2' };

    const result = await graphql(schema, mutation, null, context);
    expect(result).toMatchSnapshot();
  });

});
