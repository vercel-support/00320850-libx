# libx

A music library export tool.

## Development

> This project [bundles the React Vite project with the Flask backend server](https://stackoverflow.com/questions/44209978/serving-a-front-end-created-with-create-react-app-with-flask) in order to prevent having to run two servers for the frontend and the backend.

Rebuild the React Vite frontend.

```sh
cd www/libx/ && yarn build
```

Run the Flask development server - which will serve the frontend.

```sh
FLASK_APP=libx/app.py ENV=development PORT=5000 flask run --reload
```

