package Server.DAL.DiscountRuleDTOs;

import Server.Domain.ShoppingManager.DiscountRules.DiscountRule;
import Server.Domain.ShoppingManager.DiscountRules.MaximumCompositionDiscountRule;
import dev.morphia.annotations.Embedded;
import org.bson.codecs.pojo.annotations.BsonDiscriminator;

import java.util.List;

@Embedded
@BsonDiscriminator("MaximumCompositionDiscountRuleDTO")

public class MaximumCompositionDiscountRuleDTO extends CompoundDiscountRuleDTO {

    public MaximumCompositionDiscountRuleDTO() {
        super();
        // For Morphia
    }

    public MaximumCompositionDiscountRuleDTO(int id, List<DiscountRuleDTO> discountRules, double discount) {
        super(id, discountRules, discount);
    }

    @Override
    public DiscountRule toConcreteDiscountRule() {
        return new MaximumCompositionDiscountRule(this);
    }
}
