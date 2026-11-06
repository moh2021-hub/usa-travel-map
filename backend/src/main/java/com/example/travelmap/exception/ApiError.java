package com.example.travelmap.exception;

/** The JSON body of every error response: {"status": 404, "message": "No state with code ZZ"}. */
public record ApiError(int status, String message) {
}
