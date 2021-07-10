package Server.Domain.ShoppingManager.DTOs;

import Server.Domain.ShoppingManager.Review;

import java.util.*;

public class ProductClientDTO {

    private String name;
    private int productID;
    private int storeID;
    private double price;
    private List<String> categories;
    private List<String> keywords;
    private List<Review> reviews;
    private double rating;
    private int numRatings;

    /**
     *constructor for objects from database
     */
    public ProductClientDTO(String name, int productID, int storeID, double price, List<String> categories, List<String> keywords, List<Review> reviews, double rating, int numRatings) {
        this.name = name;
        this.productID = productID;
        this.storeID = storeID;
        this.price = price;
        this.categories = categories;
        this.keywords = keywords;
        this.reviews = reviews;
        this.rating = rating;
        this.numRatings = numRatings;
    }

    /**
     *constructor for new products
     */
    public ProductClientDTO(String name, int storeID, double price, List<String> categories, List<String> keywords) {
        this.name = name;
        this.productID = -1;
        this.storeID = storeID;
        this.price = price;
        this.categories = categories;
        this.keywords = keywords;
        this.reviews = new Vector<>();
        this.rating = 0;
        this.numRatings = 0;
    }

    public String getName() {
        return name;
    }

    public int getProductID() {
        return productID;
    }

    public int getStoreID() {
        return storeID;
    }

    public double getPrice() {
        return price;
    }

    public List<String> getCategories() {
        return categories;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public List<Review> getReviews() {
        return reviews;
    }

    public double getRating() {
        return rating;
    }

    public int getNumRatings() {
        return numRatings;
    }

    @Override
    public String toString() {
        return "Product id " + productID + ":\n" +
                "name: " + name + ", price: " + price + ", categories=" + Arrays.toString(categories.toArray()) +
                ", keywords=" + Arrays.toString(keywords.toArray()) + "\n";
    }
}
