const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'votreCleSecrete';

// Exemple de middleware d'authentification
const authenticate = (req) => {
  const tokenHeader = req.headers.authorization;
  console.log('Token reçu :', tokenHeader);

  // Vérifiez et supprimez le préfixe "Bearer"
  const token = tokenHeader ? tokenHeader.replace('Bearer ', '') : null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Token décodé :', decoded); // Ajoutez cette ligne

    if (!decoded) {
      throw new Error('Authentification invalide');
    }

    req.userId = decoded.userId;
  } catch (error) {
    console.error('Erreur d\'authentification :', error);
    throw new Error('Authentification invalide');
  }
};

// Schéma GraphQL
const schema = buildSchema(`
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
`);

// Données simulées
const users = [
  { id: "0", statut: 'user', name: 'Alice', email: 'alice@example.com' },
  { id: "1", statut: 'user', name: 'Bob', email: 'bob@example.com' },
  { id: "2", statut: 'admin', name: 'Tom', email: 'tom.schmidt@ynov.com'},
];

const posts = [
  { id: "0", title: 'Post 1', content: 'contenu post 1', author: "0" },
  { id: "1", title: 'Post 2', content: 'contenu post 2', author: "2" },
  { id: "2", title: 'Post 3', content: 'contenu post 3', author: "0" },
];

const projets = [
  {id: "0", title: 'Projet 1', content: 'Projet exemple 1', proprietaire: "1" },
  {id: "1", title: 'Projet 2', content: 'Projet exemple 2', proprietaire: "1" },
  {id: "2", title: 'Projet 3', content: 'Projet exemple 3', proprietaire: "2" },
];
// Résolveurs

const root = {

  generateAuthToken: ({ userId }) => {
    // Vérifiez si l'utilisateur existe (vous pouvez personnaliser cette logique)
    const user = users.find(u => u.id === userId);

    if (!user) {
      throw new Error('Utilisateur non trouvé');
    }

    // Créez un jeton d'authentification avec l'ID de l'utilisateur
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);

    console.log('Token généré :', token);

    return { token };
  },

  user: ({ id }, req) => {
    authenticate(req);

    const user = users.find(user => user.id === id);
    if (!id) {
      throw new Error(`Veuillez renseigner un ID.`);
    }
    if (!user) {
      throw new Error(`User avec ID ${id} non trouvé.`);
    }
    if (user) {
      user.posts = posts.filter(post => post.author === user.id);
      user.projets = projets.filter(projet => projet.proprietaire === user.id);
    }
    return user;
  },

  usersByName: ({ name }, req) => {
    authenticate(req);

    if (!name) {
      throw new Error(`Veuillez renseigner un nom.`);
    }
    return users.filter(user => user.name.toLowerCase().includes(name.toLowerCase()));
  },

  post: ({ id }, req) => {
    authenticate(req);
    const post = posts.find(post => post.id === id);
    if (!id) {
      throw new Error(`Veuillez renseigner un ID.`);
    }
    if (!post) {
      throw new Error(`Post avec ID ${id} non trouvé.`);
    }
    if (post) {
      post.author = users.find(user => user.id === post.author);
    }
    return post;
  },

  projet: ({ id }, req) => {
    authenticate(req);

    const projet = projets.find(projet => projet.id === id);
    if (!id) {
      throw new Error(`Veuillez renseigner un ID.`);
    }
    if (!user) {
      throw new Error(`Projet avec ID ${id} non trouvé.`);
    }
    if (projet) {
      projet.proprietaire = users.find(user => user.id === projet.proprietaire);
    }
    return projet;
  },

  users: (_, req) => {
    authenticate(req);

    return users.map(user => {
      return {
        ...user,
        posts: posts.filter(post => post.author === user.id),
        projets: projets.filter(projet => projet.proprietaire === user.id),
      };
    });
  },
  

  posts: (_, req) => {
    authenticate(req);

    return posts.map(post => {
      return {
        ...post,
        author: users.find(user => user.id === post.author)
      };
    });
  },

  projets: (_, req) => {
    authenticate(req);

    // Trouver l'utilisateur correspondant à req.userId
    const adminUser = users.find(user => user.id === req.userId && user.statut === 'admin');

    // Vérifiez si l'utilisateur trouvé a un statut d'administrateur
    if (!adminUser) {
      throw new Error('Vous n\'êtes pas autorisé à accéder à la liste des projets : il faut etre admin');
    }

    return projets.map(projet => {
      return {
        ...projet,
        proprietaire: users.find(user => user.id === projet.proprietaire)
      };
    });
  },

  addPost: ({ title, content, authorId }, req) => {
    authenticate(req);
  
    // Vérifiez si l'authorId correspond à l'utilisateur authentifié
    if (authorId !== req.userId) {
      throw new Error('Vous n\'êtes pas autorisé à créer un post au nom de cet utilisateur');
    }

    const newPost = { id: String(posts.length + 1), title, content, author: authorId };
    posts.push(newPost);
    return newPost;
  },

  addUser: ({ name, email, statut }, req) => {
    authenticate(req);
  
    // Trouver l'utilisateur correspondant à req.userId
    const adminUser = users.find(user => user.id === req.userId && user.statut === 'admin');
  
    // Vérifiez si l'utilisateur trouvé a un statut d'administrateur
    if (!adminUser) {
      throw new Error('Vous n\'êtes pas autorisé à créer un nouvel utilisateur : il faut être admin');
    }
  
    // Vérifiez que le statut est soit 'admin' ou 'user'
    if (statut !== 'admin' && statut !== 'user') {
      throw new Error('Le statut doit être soit admin ou user');
    }

    const newUser = { id: String(users.length), name, email, statut };
    users.push(newUser);
    return newUser;
  },
  

  addProjet: ({ title, content, proprietaireId }, req) => {
    authenticate(req);

    // Vérifiez si le proprietaireId correspond à l'utilisateur authentifié
    if (proprietaireId !== req.userId) {
      throw new Error('Vous n\'êtes pas autorisé à créer un projet au nom de cet utilisateur');
    }

    const newProj = { id: String(projets.length + 1), title, content, proprietaire: proprietaireId};
    projets.push(newProj);
    return newProj;
  },

  updateUser: ({ id, name, email }, req) => {
    authenticate(req);

    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      // Vérifiez si l'utilisateur qui tente de mettre à jour correspond à l'utilisateur authentifié
      if (id !== req.userId) {
        throw new Error('Vous n\'êtes pas autorisé à mettre à jour cet utilisateur');
      }

      if (name) users[userIndex].name = name;
      if (email) users[userIndex].email = email;

      return users[userIndex];
    }

    return null; // Utilisateur non trouvé
  },

  updatePost: ({ id, title, content }, req) => {
    authenticate(req);
    
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex !== -1) {
      const post = posts[postIndex];
      // Vérifiez si l'utilisateur qui tente de mettre à jour correspond à l'auteur
      if (post.author !== req.userId) {
        throw new Error('Vous n\'êtes pas autorisé à mettre à jour cet utilisateur');
      }

      if (title) posts[postIndex].title = title;
      if (content) posts[postIndex].content = content;

      return posts[postIndex];
    }
    return null; // Post non trouvé
  },

  updateProjet: ({ id, title, content }, req) => {
    authenticate(req);

    const projetIndex = projets.findIndex(projet => projet.id === id);
    if (projetIndex !== -1) {
      const projet = projets[projetIndex];
      // Vérifiez si l'utilisateur qui tente de mettre à jour correspond au propriétaire
      if (projet.proprietaire !== req.userId) {
        throw new Error('Vous n\'êtes pas autorisé à mettre à jour cet utilisateur');
      }
      
      if (title) projets[projetIndex].title = title;
      if (content) projets[projetIndex].content = content;

      return projets[projetIndex];
    }
    return null; // Projet non trouvé
  },

  deleteUser: ({ id }, req) => {
    authenticate(req);
  
    const userIndex = users.findIndex(user => user.id === id);
    if (userIndex !== -1) {
      // Vérifiez si l'utilisateur qui tente de supprimer correspond à l'utilisateur authentifié
      if (id !== req.userId) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer cet utilisateur');
      }
  
      const deletedUser = users.splice(userIndex, 1)[0];
  
      // Supprimer les références dans les posts et projets
      posts.forEach(post => {
        if (post.author === id) {
          delete post.author;
        }
      });
  
      projets.forEach(projet => {
        if (projet.proprietaire === id) {
          delete projet.proprietaire;
        }
      });
  
      return deletedUser;
    }
  
    return null; // Utilisateur non trouvé
  },
  
  deletePost: ({ id }, req) => {
    authenticate(req);
  
    const postIndex = posts.findIndex(post => post.id === id);
    if (postIndex !== -1) {
      const post = posts[postIndex];
  
      // Vérifiez si l'utilisateur qui tente de supprimer correspond à l'auteur du post
      if (post.author !== req.userId) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer ce post');
      }
  
      const deletedPost = posts.splice(postIndex, 1)[0];
      return deletedPost;
    }
  
    return null; // Post non trouvé
  },
  
  deleteProjet: ({ id }, req) => {
    authenticate(req);
  
    const projetIndex = projets.findIndex(projet => projet.id === id);
    if (projetIndex !== -1) {
      const projet = projets[projetIndex];
  
      // Vérifiez si l'utilisateur qui tente de supprimer correspond au propriétaire du projet
      if (projet.proprietaire !== req.userId) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer ce projet');
      }
  
      const deletedProjet = projets.splice(projetIndex, 1)[0];
      return deletedProjet;
    }
  
    return null; // Projet non trouvé
  },  

};

// Création du serveur Express
const app = express();
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true,
}));

// Lancement du serveur
if (process.env.NODE_ENV !== 'test') {
  app.listen(4000, () => console.log('Serveur GraphQL lancé sur http://localhost:4000/graphql'));
}

