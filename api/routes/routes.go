package routes

import (
	"database/sql"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type Event struct {
	ID          int    `json:"id"`
	Date        int64  `json:"date"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func GetEvents(c *gin.Context, db *sql.DB) {
	var event Event
	var events []Event

	rows, err := db.Query("SELECT * FROM events")
	if err != nil {
		panic(err)
	}
	for rows.Next() {
		rows.Scan(&event.ID, &event.Date, &event.Name, &event.Description)
		events = append(events, event)
	}

	c.IndentedJSON(http.StatusOK, events)
}

func AddEvent(c *gin.Context, db *sql.DB) {
	var newEvent Event
	if err := c.BindJSON(&newEvent); err != nil {
		return
	}

	currentTime := time.Now()

	if newEvent.Date == 0 {
		newEvent.Date = currentTime.UnixMilli()
	}

	if newEvent.Name == "" || newEvent.Description == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "Name and description are required fields"})
		return
	}

	_, err := db.Exec("INSERT INTO events (date, name, description) VALUES ($1, $2, $3)", newEvent.Date, newEvent.Name, newEvent.Description)
	if err != nil {
		panic(err)
	}

	c.IndentedJSON(http.StatusCreated, gin.H{"message": "Event added"})
}

func DeleteEvent(c *gin.Context, db *sql.DB) {
	id := c.Param("id")

	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "Id is required field"})
		return
	}

	if _, err := strconv.Atoi(id); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("Id must be integer, not %s", id)})
		return
	}

	_, err := db.Exec("DELETE FROM events WHERE id = $1", id)
	if err != nil {
		panic(err)
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Event deleted"})
}

func UpdateEvent(c *gin.Context, db *sql.DB) {
	var updatedEvent Event
	if err := c.BindJSON(&updatedEvent); err != nil {
		return
	}

	id := c.Param("id")

	if id == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "Id is required field"})
		return
	}

	if _, err := strconv.Atoi(id); err != nil {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": fmt.Sprintf("Id must be integer, not %s", id)})
		return
	}

	if updatedEvent.Name == "" || updatedEvent.Description == "" {
		c.IndentedJSON(http.StatusBadRequest, gin.H{"message": "Name and description are required fields"})
		return
	}

	_, err := db.Exec("UPDATE events SET name = $1, description = $2 WHERE id = $3", updatedEvent.Name, updatedEvent.Description, id)
	if err != nil {
		panic(err)
	}

	c.IndentedJSON(http.StatusOK, gin.H{"message": "Event updated"})
}
