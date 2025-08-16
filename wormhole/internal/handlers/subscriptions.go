package handlers

import (
	"net/http"
	"strconv"

	"wormhole/internal/models"

	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type SubscriptionRequest struct {
	Name        string  `json:"name"`
	Cost        float64 `json:"cost"`
	RenewalDate string  `json:"renewalDate"`
	Frequency   string  `json:"frequency"` // Changed from category
}

func GetSubscriptions(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userID := c.Get("user_id").(uint)
		var subs []models.Subscription
		db.Where("user_id = ?", userID).Find(&subs)
		return c.JSON(http.StatusOK, subs)
	}
}

func AddSubscription(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userID := c.Get("user_id").(uint)
		var req SubscriptionRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, "Invalid request")
		}

		sub := models.Subscription{UserID: userID, Name: req.Name, Cost: req.Cost, RenewalDate: req.RenewalDate, Frequency: req.Frequency}
		db.Create(&sub)
		return c.JSON(http.StatusCreated, sub)
	}
}

func UpdateSubscription(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userID := c.Get("user_id").(uint)
		id, _ := strconv.Atoi(c.Param("id"))

		var sub models.Subscription
		if err := db.Where("id = ? AND user_id = ?", id, userID).First(&sub).Error; err != nil {
			return c.JSON(http.StatusNotFound, "Subscription not found")
		}

		var req SubscriptionRequest
		if err := c.Bind(&req); err != nil {
			return c.JSON(http.StatusBadRequest, "Invalid request")
		}

		sub.Name = req.Name
		sub.Cost = req.Cost
		sub.RenewalDate = req.RenewalDate
		sub.Frequency = req.Frequency
		db.Save(&sub)
		return c.JSON(http.StatusOK, sub)
	}
}

func DeleteSubscription(db *gorm.DB) echo.HandlerFunc {
	return func(c echo.Context) error {
		userID := c.Get("user_id").(uint)
		id, _ := strconv.Atoi(c.Param("id"))

		var sub models.Subscription
		if err := db.Where("id = ? AND user_id = ?", id, userID).First(&sub).Error; err != nil {
			return c.JSON(http.StatusNotFound, "Subscription not found")
		}

		db.Delete(&sub)
		return c.JSON(http.StatusOK, "Deleted")
	}
}
