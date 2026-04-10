package response

import (
	"encoding/json"
	"net/http"
)

type envelope struct {
	Data  any        `json:"data"`
	Error *apiError  `json:"error"`
}

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

// OK escribe una respuesta JSON exitosa: { "data": ..., "error": null }
func OK(w http.ResponseWriter, status int, data any) {
	write(w, status, envelope{Data: data, Error: nil})
}

// Err escribe una respuesta JSON de error: { "data": null, "error": { "code": ..., "message": ... } }
func Err(w http.ResponseWriter, status int, code, message string) {
	write(w, status, envelope{Data: nil, Error: &apiError{Code: code, Message: message}})
}

func write(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(body)
}
