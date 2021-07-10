package TestComponent.UnitTesting.ShopComponentTests;

import Server.DAL.DALControllers.DALService;
import Server.Domain.CommonClasses.RatingEnum;
import Server.Domain.ShoppingManager.Product;
import Server.Domain.ShoppingManager.DTOs.ProductClientDTO;
import Server.Domain.UserManager.CommerceSystem;
import org.junit.Assert;
import org.junit.Before;
import org.junit.Test;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ProductTest {

    @Before
    public void setUp(){
        CommerceSystem.getInstance().configInit("successconfigfile.json");
        DALService.getInstance().resetDatabase();
    }

    @Test
    public void simplePriceUpdateTest(){
        ProductClientDTO productDTO = new ProductClientDTO("Oreo", 1, 22.9, null, null);
        Product product = Product.createProduct(productDTO);

        product.updatePrice(19.9);
        Assert.assertEquals(19.9, product.getPrice(), 0.0);
    }

    @Test
    public void complexPriceUpdateTest()  throws InterruptedException {
        ProductClientDTO productDTO = new ProductClientDTO("Oreo", 1, 22.9, null, null);
        Product product = Product.createProduct(productDTO);

        int numberOfThreads = 100;
        double price = product.getPrice();
        CountDownLatch latch = new CountDownLatch(numberOfThreads*2);

        ExecutorService service1 = Executors.newFixedThreadPool(numberOfThreads);
        for (int i = 0; i < numberOfThreads; i++) {
            service1.execute(() -> {
                product.updatePrice(price + 10);
                latch.countDown();
            });
        }

        ExecutorService service2 = Executors.newFixedThreadPool(numberOfThreads);
        for (int i = 0; i < numberOfThreads; i++) {
            service2.execute(() -> {
                product.updatePrice(price + 35.2);
                latch.countDown();
            });
        }

        latch.await();
        Assert.assertTrue(product.getPrice() == price + 10 || product.getPrice() == price + 35.2);
        service1.shutdownNow();
        service2.shutdownNow();
    }

    @Test
    public void simpleAddRateTest(){
        ProductClientDTO productDTO = new ProductClientDTO("Oreo", 1, 22.9, null, null);
        Product product = Product.createProduct(productDTO);

        product.addRating(RatingEnum.HIGH);
        Assert.assertEquals(4, product.getRating(), 0);
    }

    @Test
    public void mediumAddRateTest(){
        ProductClientDTO productDTO = new ProductClientDTO("Oreo", 1, 22.9, null, null);
        Product product = Product.createProduct(productDTO);

        for(int i=0; i < 20; i++)
            product.addRating(RatingEnum.HIGH);

        Assert.assertEquals(4, product.getRating(), 0.0);

        for(int i=0; i < 10; i++)
            product.addRating(RatingEnum.VERY_HIGH);

        Assert.assertEquals((double)130/30, product.getRating(), 0);

        for(int i=0; i < 5; i++)
            product.addRating(RatingEnum.VERY_BAD);

        Assert.assertEquals((double)135/35, product.getRating(), 0);
    }

    @Test
    public void complexAddRateTest() throws InterruptedException {
        ProductClientDTO productDTO = new ProductClientDTO("Oreo", 1, 22.9, null, null);
        Product product = Product.createProduct(productDTO);

        int numberOfThreads = 100;
        CountDownLatch latch = new CountDownLatch(numberOfThreads*2);

        ExecutorService service1 = Executors.newFixedThreadPool(numberOfThreads);
        for (int i = 0; i < numberOfThreads; i++) {
            service1.execute(() -> {
                product.addRating(RatingEnum.VERY_HIGH);
                latch.countDown();
            });
        }

        ExecutorService service2 = Executors.newFixedThreadPool(numberOfThreads);
        for (int i = 0; i < numberOfThreads; i++) {
            service2.execute(() -> {
                product.addRating(RatingEnum.VERY_BAD);
                latch.countDown();
            });
        }

        latch.await();
        // This range is for the numerical floating error
        Assert.assertEquals(3, product.getRating(), 0.001);
        service1.shutdownNow();
        service2.shutdownNow();
    }
}
