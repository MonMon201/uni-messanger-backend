# NestJS Application with ScyllaDB

This is a NestJS application using ScyllaDB as its database. The setup includes Docker Compose to orchestrate the services.

## Prerequisites

- Docker
- Docker Compose

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Build and Start the Docker Containers

```bash
docker-compose up -d --build
```

This command will build the Docker images and start the containers in detached mode.

### 3. Initialize the ScyllaDB

To initialize the ScyllaDB with the required schema, follow these steps:

1. Find the Scylla container ID or name:

    ```bash
    docker ps
    ```

   Look for the container with the name `scylla`.

2. Copy the `init-db.cql` file into the Scylla container:

    ```bash
    docker cp init-db.cql <scylla-container-id-or-name>:/init-db.cql
    ```

   Make sure to replace `<scylla-container-id-or-name>` with the actual container ID or name.

3. Execute the `cqlsh` command within the Scylla container to run the contents of `init-db.cql`:

    ```bash
    docker exec -it <scylla-container-id-or-name> cqlsh -f /init-db.cql
    ```

   Again, replace `<scylla-container-id-or-name>` with the actual container ID or name.

### 4. Access the Application

The NestJS application should now be running and accessible. By default, it runs on port `3000`. You can access it via `http://localhost:3000`.

### 5. API Documentation with Swagger

This application includes Swagger for API documentation. Once the application is running, you can access the Swagger UI at:

```plaintext
http://localhost:3000/docs
```

The Swagger UI provides a web-based interface to explore and interact with the API endpoints defined in the application.

## Environment Variables

The application uses the following environment variables, which are set in the `docker-compose.yml` file:

- `NODE_ENV`: The environment mode (e.g., `production`).
- `APP_PORT`: The port on which the application runs.
- `DB_CONTACT_POINTS`: The contact points for the ScyllaDB cluster.
- `DB_LOCAL_DC`: The local data center for the ScyllaDB cluster.
- `DB_KEYSPACE`: The keyspace to use in ScyllaDB.
- `DB_USERNAME`: The username for ScyllaDB authentication.
- `DB_PASSWORD`: The password for ScyllaDB authentication.
- `JWT_SECRET`: The secret key for JWT authentication.
- `JWT_EXPIRE`: The expiration time for JWT tokens.

## Stopping the Containers

To stop the running containers, use:

```bash
docker-compose down
```

## Logs and Debugging

To view the logs of the NestJS application, use:

```bash
docker logs -f nestjs-app
```

For the ScyllaDB logs, use:

```bash
docker logs -f scylla
```

## Troubleshooting

- Ensure that Docker and Docker Compose are installed and running.
- Check the logs for any errors during startup.
- Verify the initialization of the database by checking the ScyllaDB logs.
