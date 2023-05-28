package main

import (
	"database/sql"
	"os"

	"ithappened/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
)

func main() {
	godotenv.Load(".env")
	var dbURL = os.Getenv("DATABASE_URL")
	var port = os.Getenv("PORT")

	if dbURL == "" || port == "" {
		panic("Missing environment variables")
	}

	db, err := sql.Open("postgres", dbURL)

	if err != nil {
		panic(err)
	}

	defer db.Close()

	db.Query("CREATE TABLE IF NOT EXISTS events (id SERIAL PRIMARY KEY, date TEXT, name TEXT, description TEXT)")

	router := gin.Default()
	router.GET("/events", func(c *gin.Context) {
		routes.GetEvents(c, db)
	})
	router.POST("/events", func(c *gin.Context) {
		routes.AddEvent(c, db)
	})
	router.DELETE("/events/:id", func(c *gin.Context) {
		routes.DeleteEvent(c, db)
	})
	router.PUT("/events/:id", func(c *gin.Context) {
		routes.UpdateEvent(c, db)
	})
	router.Run(":" + port)
}
