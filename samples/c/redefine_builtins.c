#define _GNU_SOURCE
#include <dlfcn.h>
#include <stdarg.h>

#include <stdio.h>
#include <string.h>

char *strcpy(char *dest, const char *src) {
   char *(*_builtin_strcpy)(char *, const char *) = dlsym(RTLD_NEXT, "strcpy");
   char* _return_value = _builtin_strcpy(dest, src);

   return _return_value;
}

char *strncpy(char *dest, const char *src, size_t n) {
   char *(*_builtin_strncpy)(char *, const char *, size_t) = dlsym(RTLD_NEXT, "strncpy");
   char* _return_value = _builtin_strncpy(dest, src, n);

   return _return_value;
}

int printf(const char *format, ...) {
   int (*_builtin_printf)(const char *, ...) = dlsym(RTLD_NEXT, "printf");

   va_list args;
   va_start(args, format);
   int _return_value = _builtin_printf(format, args);
   va_end(args);

   return _return_value;
}

int main() {
   char *str = "Hello World !";
   char dest[6];

   strncpy(dest, str, 5);
   dest[5] = '\0';

   printf("%s", dest);

   return 0;
}
