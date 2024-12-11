# libx

A music library export tool.

<img src="https://i.imgur.com/wI5WPCe.png" />

## Usage

Check it out at [libx.stream](https://libx.stream)

## Dependencies

- [ChakraUI](https://www.chakra-ui.com/)
- [Flask](https://flask.palletsprojects.com/en/stable/)

## Development

> This project [bundles the React Vite project with the Flask backend server](https://stackoverflow.com/questions/44209978/serving-a-front-end-created-with-create-react-app-with-flask) in order to prevent having to run two servers for the frontend and the backend.

Use `watch` to reload `yarn` assets on an interval.

```sh
cd www/libx && watch -n 5 yarn build
```

Run the Flask development server - which will serve the frontend.

```sh
ENV=development FLASK_APP=libx/app.py FLASK_RUN_HOST=127.0.0.1 FLASK_RUN_PORT=5000 flask run --reload
```
