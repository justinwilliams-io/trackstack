package models

import "gorm.io/gorm"

type User struct {
	gorm.Model
	Email    string `gorm:"unique"`
	Password string
}

type Subscription struct {
	gorm.Model
	UserID      uint
	Name        string
	Cost        float64
	RenewalDate string // ISO format: YYYY-MM-DD
	Frequency   string // e.g., "weekly", "monthly", "quarterly", "annual"
}
