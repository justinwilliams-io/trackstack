package main

import (
	"net/http"
	"os"

	"wormhole/internal/handlers"
	"wormhole/internal/models"

	"github.com/golang-jwt/jwt/v4"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var db *gorm.DB
var jwtSecret = []byte(os.Getenv("JWT_SECRET")) // Set via env or Fly secrets

func main() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"}, // Restrict in prod
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete},
	}))

	// DB connection
	var err error
	dbPath := "trackstack.db"
	if os.Getenv("FLY_APP_NAME") != "" {
		dbPath = "/app/data/trackstack.db" // For Fly volume
	}
	db, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{})
	if err != nil {
		panic("Failed to connect to DB")
	}
	db.AutoMigrate(&models.User{}, &models.Subscription{})

	// Public routes
	e.POST("/register", handlers.Register(db))
	e.POST("/login", handlers.Login(db, jwtSecret)) // Pass jwtSecret here

	// Authenticated routes
	api := e.Group("/api")
	api.Use(jwtMiddleware)
	api.GET("/subscriptions", handlers.GetSubscriptions(db))
	api.POST("/subscriptions", handlers.AddSubscription(db))
	api.PUT("/subscriptions/:id", handlers.UpdateSubscription(db))
	api.DELETE("/subscriptions/:id", handlers.DeleteSubscription(db))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	e.Logger.Fatal(e.Start(":" + port))
}

func jwtMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		tokenStr := c.Request().Header.Get("Authorization")
		if tokenStr == "" {
			return c.JSON(http.StatusUnauthorized, "Missing token")
		}
		if len(tokenStr) > 7 && tokenStr[:7] == "Bearer " {
			tokenStr = tokenStr[7:]
		}

		token, err := jwt.Parse(tokenStr, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})
		if err != nil || !token.Valid {
			return c.JSON(http.StatusUnauthorized, "Invalid token")
		}

		claims := token.Claims.(jwt.MapClaims)
		c.Set("user_id", uint(claims["user_id"].(float64)))
		return next(c)
	}
}
