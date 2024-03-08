# Refactor a nuestro login

### Aspectos a incluir

- Se deberá contar con un hasheo de contraseña utilizando bcrypt
- Se deberá contar con una implementación de passport, tanto para register como para login.
- Implementar el método de autenticación de GitHub a la vista de login.

### Proceso de testing

- Al cargar el proyecto, éste deberá comenzar en la pantalla de login.
- Al no tener un usuario registrado aún, se procederá a hacer un registro, por lo que la pantalla de login debe tener un link de “regístrate”, el cual nos redireccione a la pantalla de registro. 
- Al registrarme con los datos solicitados, se revisará la contraseña guardada en la base de datos, cuidando que ésta esté correctamente hasheada.
- Se realizará el proceso de login con las mismas credenciales con las que se registró el usuario, corroborando que el login funcione correctamente y redirija a la pantalla principal.
- Además, la pantalla de login deberá contar con un botón “entrar con Github” el cual al hacer click nos permita entrar directamente a la página con los datos obtenidos de Github.
- Se corroborará en la base de datos que el nuevo usuario “creado con Github” cuente con un password vacío.