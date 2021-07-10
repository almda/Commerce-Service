package Server.Domain.ShoppingManager.DiscountRules;

import Server.Domain.ShoppingManager.DTOs.ProductClientDTO;

import java.util.Map;

public abstract class LeafDiscountRule implements DiscountRule {
    protected final static int NOT_SET = -1;
    protected final static double COMPOSITION_USE_ONLY = -100;
    protected int id;
    protected double discount;

    public LeafDiscountRule(double discount) {
        this.discount = discount;
        this.id = NOT_SET;
    }

    public abstract double calcDiscount(Map<ProductClientDTO, Integer> shoppingBasket);

    public abstract String getDescription();

    public double getDiscount() {
        return discount;
    }

    public void setDiscount(double discount) {
        this.discount = discount;
    }

    @Override
    public int getID() {
        return id;
    }

    @Override
    public void setID(int id)
    {
        this.id = id;
    }
}
