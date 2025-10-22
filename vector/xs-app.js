module.exports = {
  authenticationMethod: "none",
  routes: [
    {
      source: "^/api/(.*)$",
      target: "$1",
      destination: "backend-api"
    },
    {
      source: "^/(.*)$",
      target: "$1",
      destination: "frontend"
    }
  ]
};